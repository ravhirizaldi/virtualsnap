<template>
  <div
    id="app-container"
    class="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
  >
    <main class="flex-grow flex items-center justify-center py-2 sm:py-4 lg:py-6">
      <HomeView
        @loading="handleLoading"
        @result="handleResult"
        @toast="handleToast"
      />
    </main>

    <!-- Floating API Key Settings Button (only visible when no env API key) -->
    <button
      v-if="!hasEnvironmentApiKey"
      type="button"
      class="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 z-50 group"
      title="API Key Settings"
      @click="showApiKeyModal = true"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2 2 2 0 01-2 2m-2-2H9m6 0V9a2 2 0 00-2-2m0 0H9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9z"
        />
      </svg>
      <!-- Tooltip -->
      <div
        class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
      >
        API Settings
      </div>
    </button>

    <!-- Loading Spinner -->
    <LoadingSpinner
      :is-loading="isLoading"
      :loading-text="loadingText"
    />

    <!-- Result Modal -->
    <ResultModal
      :visible="showModal"
      :image="resultImage"
      @close="closeModal"
    />

    <!-- Toast Container -->
    <ToastContainer
      :toasts="toasts"
      @remove="removeToast"
    />

    <!-- API Key Modal -->
    <ApiKeyModal
      :visible="showApiKeyModal"
      @close="handleApiKeyModalClose"
      @save="handleApiKeySave"
      @clear="handleApiKeyClear"
    />

    <!-- Vercel Speed Insights -->
    <SpeedInsights />
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue';
  import HomeView from './views/HomeView.vue';
  import LoadingSpinner from './components/LoadingSpinner.vue';
  import ResultModal from './components/ResultModal.vue';
  import ToastContainer from './components/ToastContainer.vue';
  import ApiKeyModal from './components/ApiKeyModal.vue';
  import { useToast } from './composables/useToast.js';
  import { useApiKey } from './composables/useApiKey.js';
  import { SpeedInsights } from '@vercel/speed-insights/vue';

  export default {
    name: 'App',
    components: {
      HomeView,
      LoadingSpinner,
      ResultModal,
      ToastContainer,
      ApiKeyModal,
      SpeedInsights,
    },
    setup() {
      const { toasts, showToast, removeToast } = useToast();
      const { isApiKeyAvailable, hasEnvironmentApiKey, setApiKey, validateApiKey, clearApiKey } =
        useApiKey();

      const isLoading = ref(false);
      const loadingText = ref('Preparing...');
      const showModal = ref(false);
      const resultImage = ref(null);
      const showApiKeyModal = ref(false);

      const handleLoading = (loading, text = 'Loading...') => {
        isLoading.value = loading;
        loadingText.value = text;
      };

      const handleResult = image => {
        resultImage.value = image;
        showModal.value = true;
      };

      const handleToast = (message, type = 'error') => {
        showToast(message, type);
      };

      const closeModal = () => {
        showModal.value = false;
        resultImage.value = null;
      };

      const checkApiKey = () => {
        if (!isApiKeyAvailable.value) {
          showApiKeyModal.value = true;
        }
      };

      const handleApiKeyModalClose = () => {
        // If no API key is available and user closes modal, show a warning
        if (!isApiKeyAvailable.value) {
          showToast('API key is required to use this application', 'error');
        }
        showApiKeyModal.value = false;
      };

      const handleApiKeySave = async apiKey => {
        // Validate the API key first
        const validation = await validateApiKey(apiKey);

        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid API key');
        }

        // Save the API key
        setApiKey(apiKey);

        // Close the modal
        showApiKeyModal.value = false;

        // Show success message
        showToast('API key saved successfully!', 'success');
      };

      const handleApiKeyClear = () => {
        clearApiKey();
        showApiKeyModal.value = false;
        showToast('API key cleared successfully', 'success');
        // Re-check API key availability which will show modal again if needed
        setTimeout(checkApiKey, 500);
      };

      // Check for API key on app mount
      onMounted(() => {
        checkApiKey();
      });

      return {
        toasts,
        isLoading,
        loadingText,
        showModal,
        resultImage,
        showApiKeyModal,
        hasEnvironmentApiKey,
        handleLoading,
        handleResult,
        handleToast,
        closeModal,
        removeToast,
        handleApiKeyModalClose,
        handleApiKeySave,
        handleApiKeyClear,
      };
    },
  };
</script>
