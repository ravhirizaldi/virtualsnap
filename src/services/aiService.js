import { GoogleGenAI, Modality } from '@google/genai';
import scenariosData from '../prompts/scenarios.json';

class AIService {
  constructor() {
    this.ai = null;
    this.scenarios = scenariosData.scenarios;
    this.initializeAI();
  }

  getApiKey() {
    // First try environment variable (has priority for development)
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envApiKey && envApiKey.trim().length > 0) {
      return envApiKey;
    }

    // Fallback to localStorage (user provided)
    const userApiKey = localStorage.getItem('gemini_api_key');
    if (userApiKey) {
      return userApiKey;
    }

    return null;
  }

  isApiKeyAvailable() {
    const apiKey = this.getApiKey();
    return apiKey && apiKey.trim().length > 0;
  }

  hasEnvironmentApiKey() {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    return envApiKey && envApiKey.trim().length > 0;
  }

  setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key provided');
    }

    // Store in localStorage
    localStorage.setItem('gemini_api_key', apiKey.trim());

    // Reinitialize AI service with new key
    this.initializeAI();
  }

  initializeAI() {
    try {
      const apiKey = this.getApiKey();
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      } else {
        this.ai = null;
      }
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      this.ai = null;
    }
  }

  async fileToGenerativePart(file) {
    try {
      const processedBlob = await this.preprocessImage(file);
      const dataUrl = await this.blobToDataUrl(processedBlob);
      const base64Data = typeof dataUrl === 'string' ? dataUrl.split(',')[1] : null;

      if (!base64Data) {
        throw new Error('Failed to encode image');
      }

      const mimeType = processedBlob?.type || this.getOutputMimeType(file.type);

      return {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      };
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw error;
    }
  }

  async preprocessImage(file) {
    const objectUrl = URL.createObjectURL(file);

    try {
      const image = await this.loadImage(objectUrl);
      const { width, height } = this.calculateTargetDimensions(image);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        throw new Error('Unable to acquire 2D context');
      }

      context.filter = 'brightness(1.05) contrast(0.95) saturate(0.98)';
      context.drawImage(image, 0, 0, width, height);
      this.applyMicroNoise(context, width, height);

      const mimeType = this.getOutputMimeType(file.type);
      const quality = mimeType === 'image/jpeg' ? 0.88 + Math.random() * 0.1 : undefined;

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          result => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error('Image encoding failed'));
            }
          },
          mimeType,
          quality
        );
      });

      return blob;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = error => reject(error);
      image.src = src;
    });
  }

  calculateTargetDimensions(image) {
    const maxDimension = 1536;
    const largestSide = Math.max(image.width, image.height);

    if (!largestSide) {
      return { width: image.width || 1, height: image.height || 1 };
    }

    if (largestSide <= maxDimension) {
      return { width: image.width, height: image.height };
    }

    const scale = maxDimension / largestSide;
    return {
      width: Math.max(1, Math.round(image.width * scale)),
      height: Math.max(1, Math.round(image.height * scale)),
    };
  }

  applyMicroNoise(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Tambahin sedikit variasi ke brightness tiap pixel
      const noise = (Math.random() - 0.5) * 2; // range -1 to +1
      data[i] += noise; // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }
    ctx.putImageData(imgData, 0, 0);
  }

  getOutputMimeType(originalType) {
    if (originalType === 'image/gif') {
      return 'image/webp';
    }

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (supportedTypes.includes(originalType)) {
      return originalType;
    }
    return 'image/jpeg';
  }

  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(blob);
    });
  }

  getScenarios() {
    return this.scenarios;
  }

  getScenarioById(id) {
    return this.scenarios.find(scenario => scenario.id === id);
  }

  async validateApiKey(apiKey) {
    try {
      // Create a temporary AI instance to test the key
      const testAI = new GoogleGenAI({ apiKey });

      // Try a simple request to validate the key
      await testAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: 'Hello' }] },
      });

      // If we get here, the key works
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error.message?.includes('API_KEY_INVALID')
          ? 'Invalid API key'
          : 'Failed to validate API key',
      };
    }
  }

  async analyzeImage(imagePart, scenarioId = 'car_selfie') {
    if (!this.ai) {
      throw new Error('AI service not initialized. Please provide a valid API key.');
    }

    const scenario = this.getScenarioById(scenarioId);
    const analysisPrompt = scenario ? scenario.analysisPrompt : this.scenarios[0].analysisPrompt;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: analysisPrompt }] },
    });

    return response.text;
  }

  createFinalPrompt(analysis1, analysis2, scenarioId = 'car_selfie') {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario with id '${scenarioId}' not found`);
    }

    return scenario.mainPrompt.replace('{analysis1}', analysis1).replace('{analysis2}', analysis2);
  }

  async generateImage(
    part1,
    part2,
    analysis1,
    analysis2,
    scenarioId = 'car_selfie',
    customPrompt = null
  ) {
    if (!this.ai) {
      throw new Error('AI service not initialized. Please provide a valid API key.');
    }

    const finalPrompt = customPrompt || this.createFinalPrompt(analysis1, analysis2, scenarioId);
    const noiseWords = ['alt', 'v2', 'new', 'fresh', 'take2', 'revised'];
    const noise = noiseWords[Math.floor(Math.random() * noiseWords.length)];
    const perfectPrompt = `${finalPrompt}\n\n# ${noise}`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [part1, part2, { text: perfectPrompt }] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        seed: Math.floor(Math.random() * 1e6),
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          const { data, mimeType } = part.inlineData;
          return `data:${mimeType};base64,${data}`;
        }
      }
    }

    throw new Error(response.text?.trim() || 'Model did not return an image.');
  }

  // Backward compatibility
  async generateCarSelfie(part1, part2, analysis1, analysis2, customPrompt = null) {
    return this.generateImage(part1, part2, analysis1, analysis2, 'car_selfie', customPrompt);
  }
}

export default new AIService();
