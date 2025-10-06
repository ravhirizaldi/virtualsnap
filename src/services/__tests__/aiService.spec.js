import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadService(envValue = '') {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_GEMINI_API_KEY', envValue);
  localStorage.clear();

  const module = await import('../aiService.js');
  const { GoogleGenAI } = await import('@google/genai');
  GoogleGenAI.mockClear();

  return { aiService: module.default, GoogleGenAI };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('aiService utility behaviour', () => {
  it('prefers environment API keys over local storage', async () => {
    const { aiService } = await loadService('env-key');

    localStorage.setItem('gemini_api_key', 'user-key');

    expect(aiService.getApiKey()).toBe('env-key');
    expect(aiService.hasEnvironmentApiKey()).toBe(true);
    expect(aiService.isApiKeyAvailable()).toBe(true);
  });

  it('stores trimmed API keys and reinitializes the SDK', async () => {
    const { aiService, GoogleGenAI } = await loadService();

    const trimmedKey = 'AIza-trimmed-key';
    aiService.setApiKey(`  ${trimmedKey}  `);

    expect(localStorage.getItem('gemini_api_key')).toBe(trimmedKey);
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: trimmedKey });
    expect(aiService.isApiKeyAvailable()).toBe(true);
  });

  it('calculates target dimensions within limits', async () => {
    const { aiService } = await loadService();

    const resized = aiService.calculateTargetDimensions({ width: 4000, height: 1000 });

    expect(resized.width).toBeLessThanOrEqual(1536);
    expect(resized.height).toBeLessThanOrEqual(1536);
  });

  it('returns expected mime types for different inputs', async () => {
    const { aiService } = await loadService();

    expect(aiService.getOutputMimeType('image/png')).toBe('image/png');
    expect(aiService.getOutputMimeType('image/gif')).toBe('image/webp');
    expect(aiService.getOutputMimeType('application/pdf')).toBe('image/jpeg');
  });

  it('creates prompts with injected analyses and validates scenarios', async () => {
    const { aiService } = await loadService();

    const prompt = aiService.createFinalPrompt('first analysis', 'second analysis', 'car_selfie');

    expect(prompt).toContain('first analysis');
    expect(prompt).toContain('second analysis');
    expect(() => aiService.createFinalPrompt('a', 'b', 'unknown')).toThrow(
      "Scenario with id 'unknown' not found"
    );
  });

  it('throws descriptive errors when the AI client is unavailable', async () => {
    const { aiService } = await loadService();

    aiService.ai = null;

    await expect(
      aiService.generateImage({ inlineData: {} }, { inlineData: {} }, 'a', 'b', 'car_selfie')
    ).rejects.toThrow('AI service not initialized. Please provide a valid API key.');
  });

  it('requires an initialized AI client before analyzing images', async () => {
    const { aiService } = await loadService();

    aiService.ai = null;

    await expect(aiService.analyzeImage({ inlineData: {} }, 'car_selfie')).rejects.toThrow(
      'AI service not initialized. Please provide a valid API key.'
    );
  });

  it('returns base64 data when the model responds with inline data', async () => {
    const { aiService } = await loadService();

    aiService.ai = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          candidates: [
            {
              content: {
                parts: [
                  { text: 'mock-response' },
                  { inlineData: { data: 'base64payload', mimeType: 'image/png' } },
                ],
              },
            },
          ],
        }),
      },
    };

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = await aiService.generateImage(
      { inlineData: { data: 'foo' } },
      { inlineData: { data: 'bar' } },
      'analysis-one',
      'analysis-two',
      'car_selfie'
    );

    expect(aiService.ai.models.generateContent).toHaveBeenCalled();
    expect(result).toBe('data:image/png;base64,base64payload');

    randomSpy.mockRestore();
  });

  it('flags invalid API keys when the provider rejects the request', async () => {
    const { aiService, GoogleGenAI } = await loadService();

    GoogleGenAI.mockImplementationOnce(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('API_KEY_INVALID: bad key')),
      },
    }));

    const result = await aiService.validateApiKey('bad-key');

    expect(result).toEqual({ valid: false, error: 'Invalid API key' });
  });

  it('returns generic validation errors for unexpected failures', async () => {
    const { aiService, GoogleGenAI } = await loadService();

    GoogleGenAI.mockImplementationOnce(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('network timeout')),
      },
    }));

    const result = await aiService.validateApiKey('other-key');

    expect(result).toEqual({ valid: false, error: 'Failed to validate API key' });
  });

  it('analyzes images using fallback prompt when scenario is missing', async () => {
    const { aiService } = await loadService('env-key');

    aiService.ai = {
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: 'analysis output' }),
      },
    };

    const payload = { inlineData: { data: 'part' } };
    const result = await aiService.analyzeImage(payload, 'unknown-scenario');

    expect(result).toBe('analysis output');
    expect(aiService.ai.models.generateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [payload, { text: aiService.scenarios[0].analysisPrompt }],
      },
    });
  });

  it('throws descriptive errors when image generation yields no inline data', async () => {
    const { aiService } = await loadService('env-key');

    aiService.ai = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: 'Try again later',
          candidates: [
            {
              content: {
                parts: [{ text: 'no inline image' }],
              },
            },
          ],
        }),
      },
    };

    await expect(
      aiService.generateImage(
        { inlineData: {} },
        { inlineData: {} },
        'first',
        'second',
        'car_selfie'
      )
    ).rejects.toThrow('Try again later');
  });

  it('converts preprocessed blobs to inline data for uploads', async () => {
    const { aiService } = await loadService('env-key');

    const preprocessSpy = vi
      .spyOn(aiService, 'preprocessImage')
      .mockResolvedValue(new Blob(['binary'], { type: 'image/png' }));
    const dataUrlSpy = vi
      .spyOn(aiService, 'blobToDataUrl')
      .mockResolvedValue('data:image/png;base64,Zm9v');

    const part = await aiService.fileToGenerativePart({ type: 'image/png' });

    expect(preprocessSpy).toHaveBeenCalled();
    expect(dataUrlSpy).toHaveBeenCalled();
    expect(part).toEqual({
      inlineData: {
        data: 'Zm9v',
        mimeType: 'image/png',
      },
    });

    preprocessSpy.mockRestore();
    dataUrlSpy.mockRestore();
  });

  it('adds gentle micro-noise to canvas pixel data', async () => {
    const { aiService } = await loadService('env-key');

    const data = new Uint8ClampedArray(8);
    const ctx = {
      getImageData: vi.fn().mockReturnValue({ data }),
      putImageData: vi.fn(),
    };

    aiService.applyMicroNoise(ctx, 1, 2);

    expect(ctx.getImageData).toHaveBeenCalledWith(0, 0, 1, 2);
    expect(ctx.putImageData).toHaveBeenCalled();
  });

  it('delegates generateCarSelfie to generateImage with the default scenario', async () => {
    const { aiService } = await loadService('env-key');

    const generateImageSpy = vi
      .spyOn(aiService, 'generateImage')
      .mockResolvedValue('mocked-image-data');

    const result = await aiService.generateCarSelfie('p1', 'p2', 'a1', 'a2', 'prompt');

    expect(generateImageSpy).toHaveBeenCalledWith('p1', 'p2', 'a1', 'a2', 'car_selfie', 'prompt');
    expect(result).toBe('mocked-image-data');

    generateImageSpy.mockRestore();
  });
});
