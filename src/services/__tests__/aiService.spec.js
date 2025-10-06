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
});
