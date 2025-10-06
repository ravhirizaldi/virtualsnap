<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ hasExistingKey ? 'Update API Key' : 'Setup Required' }}
        </h3>
      </div>

      <div class="mb-4">
        <p
          v-if="!hasExistingKey"
          class="text-gray-600 mb-4"
        >
          To use this app, you need to provide your personal Gemini API key. Your key will be stored
          locally on your device and never shared.
        </p>
        <p
          v-else
          class="text-gray-600 mb-4"
        >
          Update your Gemini API key. Your key is stored locally on your device and never shared.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p class="text-sm text-blue-800">
            <strong>How to get your API key:</strong>
          </p>
          <ol class="text-sm text-blue-700 mt-2 ml-4 list-decimal">
            <li>
              Go to
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                class="underline"
              >Google AI Studio</a>
            </li>
            <li>Click "Create API Key"</li>
            <li>Copy the generated key</li>
            <li>Paste it below</li>
          </ol>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label
            for="api-key"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Gemini API Key
          </label>
          <input
            id="api-key"
            v-model="apiKey"
            type="password"
            placeholder="AIzaSy..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'border-red-500': error }"
            required
          >
          <p
            v-if="error"
            class="mt-1 text-sm text-red-600"
          >
            {{ error }}
          </p>
        </div>

        <div class="flex justify-between">
          <div>
            <button
              v-if="hasExistingKey"
              type="button"
              class="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
              :disabled="loading"
              @click="clearApiKey"
            >
              Clear Key
            </button>
          </div>
          <div class="flex space-x-3">
            <button
              type="button"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              :disabled="loading"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading || !apiKey.trim()"
            >
              {{ loading ? 'Validating...' : 'Save Key' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import { ref, computed } from 'vue';
  import { useApiKey } from '../composables/useApiKey.js';

  export default {
    name: 'ApiKeyModal',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['close', 'save', 'clear'],
    setup(props, { emit }) {
      const { clearApiKey: clearApiKeyFromComposable } = useApiKey();

      const apiKey = ref('');
      const error = ref('');
      const loading = ref(false);

      const hasExistingKey = computed(() => {
        return localStorage.getItem('gemini_api_key') !== null;
      });

      const validateApiKey = key => {
        // Basic validation for Gemini API key format
        if (!key || key.length < 10) {
          return 'API key is too short';
        }
        if (!key.startsWith('AIza')) {
          return 'Invalid API key format. Gemini API keys start with "AIza"';
        }
        return null;
      };

      const handleSubmit = async () => {
        error.value = '';

        const validation = validateApiKey(apiKey.value.trim());
        if (validation) {
          error.value = validation;
          return;
        }

        loading.value = true;

        try {
          // Emit the key to parent for validation
          await emit('save', apiKey.value.trim());
          apiKey.value = '';
        } catch (err) {
          error.value = err.message || 'Failed to validate API key';
        } finally {
          loading.value = false;
        }
      };

      const clearApiKey = () => {
        clearApiKeyFromComposable();
        emit('clear');
        apiKey.value = '';
      };

      return {
        apiKey,
        error,
        loading,
        hasExistingKey,
        handleSubmit,
        clearApiKey,
      };
    },
  };
</script>
