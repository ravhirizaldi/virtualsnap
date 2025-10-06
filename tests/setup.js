import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@google/genai', () => {
  const mockModels = {
    generateContent: vi.fn().mockResolvedValue({
      text: '',
      candidates: [
        {
          content: {
            parts: [],
          },
        },
      ],
    }),
  };

  const GoogleGenAI = vi.fn(() => ({
    models: mockModels,
  }));

  return {
    GoogleGenAI,
    Modality: {
      IMAGE: 'image',
      TEXT: 'text',
    },
  };
});
