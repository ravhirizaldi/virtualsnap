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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({
            inlineData: {
              data: reader.result.split(',')[1],
              mimeType: file.type,
            },
          });
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
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

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [part1, part2, { text: finalPrompt }] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        seed: Math.floor(Math.random() * 1000000),
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
