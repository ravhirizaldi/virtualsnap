import { ref, computed } from 'vue';
import aiService from '../services/aiService.js';

const apiKeyAvailable = ref(aiService.isApiKeyAvailable());

// Listen for localStorage changes to update the status
const handleStorageChange = () => {
  apiKeyAvailable.value = aiService.isApiKeyAvailable();
};

// Add event listener for localStorage changes
window.addEventListener('storage', handleStorageChange);

export const useApiKey = () => {
  const isApiKeyAvailable = computed(() => apiKeyAvailable.value);
  const hasEnvironmentApiKey = computed(() => aiService.hasEnvironmentApiKey());

  const updateApiKeyStatus = () => {
    apiKeyAvailable.value = aiService.isApiKeyAvailable();
  };

  const setApiKey = key => {
    aiService.setApiKey(key);
    updateApiKeyStatus();
  };

  const validateApiKey = async key => {
    return await aiService.validateApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    aiService.initializeAI(); // Reinitialize without key
    updateApiKeyStatus();
  };

  return {
    isApiKeyAvailable,
    hasEnvironmentApiKey,
    updateApiKeyStatus,
    setApiKey,
    validateApiKey,
    clearApiKey,
  };
};
