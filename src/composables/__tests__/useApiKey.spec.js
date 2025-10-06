import { beforeEach, describe, expect, it, vi } from 'vitest';

let isAvailable = false;

const isApiKeyAvailableMock = vi.fn(() => isAvailable);
const hasEnvironmentApiKeyMock = vi.fn(() => false);
const setApiKeyMock = vi.fn(key => {
  isAvailable = Boolean(key?.trim());
});
const validateApiKeyMock = vi.fn(async key => ({ valid: key.startsWith('AIza') }));
const initializeAIMock = vi.fn(() => {
  isAvailable = false;
});

vi.mock('../../services/aiService.js', () => ({
  default: {
    isApiKeyAvailable: (...args) => isApiKeyAvailableMock(...args),
    hasEnvironmentApiKey: (...args) => hasEnvironmentApiKeyMock(...args),
    setApiKey: (...args) => setApiKeyMock(...args),
    validateApiKey: (...args) => validateApiKeyMock(...args),
    initializeAI: (...args) => initializeAIMock(...args),
  },
}));

describe('useApiKey', () => {
  beforeEach(() => {
    isAvailable = false;
    localStorage.clear();
    vi.resetModules();
    isApiKeyAvailableMock.mockClear();
    hasEnvironmentApiKeyMock.mockClear();
    setApiKeyMock.mockClear();
    validateApiKeyMock.mockClear();
    initializeAIMock.mockClear();
  });

  it('reflects availability after setting an API key', async () => {
    const { useApiKey } = await import('../useApiKey.js');
    const { isApiKeyAvailable, setApiKey } = useApiKey();

    expect(isApiKeyAvailable.value).toBe(false);

    setApiKey('AIza-valid-key');

    expect(setApiKeyMock).toHaveBeenCalledWith('AIza-valid-key');
    expect(isApiKeyAvailable.value).toBe(true);
    expect(isApiKeyAvailableMock).toHaveBeenCalled();
  });

  it('delegates API key validation to the service', async () => {
    const { useApiKey } = await import('../useApiKey.js');
    const { validateApiKey } = useApiKey();

    const result = await validateApiKey('AIza-sample');

    expect(validateApiKeyMock).toHaveBeenCalledWith('AIza-sample');
    expect(result).toEqual({ valid: true });
  });

  it('clears stored keys and resets state', async () => {
    localStorage.setItem('gemini_api_key', 'AIza-existing');
    isAvailable = true;

    const { useApiKey } = await import('../useApiKey.js');
    const { clearApiKey, isApiKeyAvailable } = useApiKey();

    clearApiKey();

    expect(localStorage.getItem('gemini_api_key')).toBeNull();
    expect(initializeAIMock).toHaveBeenCalledTimes(1);
    expect(isApiKeyAvailable.value).toBe(false);
  });
});
