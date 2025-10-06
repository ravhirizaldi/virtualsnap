<template>
  <div class="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
    <div
      class="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl border border-white/20 space-y-4 sm:space-y-5 lg:space-y-6 relative"
    >
      <!-- Disclaimer Icon - Always visible -->
      <div class="absolute top-4 right-4 z-10">
        <div class="disclaimer-tooltip-container relative">
          <svg
            class="w-8 h-8 text-amber-500 bg-white bg-opacity-90 rounded-full p-1 cursor-help hover:bg-opacity-100 transition-all duration-200 shadow-lg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            />
          </svg>
          <!-- Disclaimer Tooltip -->
          <div
            class="disclaimer-tooltip absolute right-0 top-10 w-64 sm:w-80 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg shadow-xl opacity-0 invisible transition-all duration-200 z-20"
          >
            <div class="font-semibold mb-2 flex items-center text-amber-700">
              <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
              Important Notice
            </div>
            <div class="text-amber-700 leading-relaxed">
              AI results may be inaccurate. For best results, try generating analysis multiple times
              or use different images of the same object.
            </div>
            <!-- Arrow -->
            <div
              class="absolute -top-1 right-3 w-2 h-2 bg-amber-50 border-l border-t border-amber-200 rotate-45"
            />
          </div>
        </div>
      </div>

      <!-- Intro Text -->
      <div class="text-center">
        <div class="flex justify-center mb-4">
          <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <CameraIcon class="w-8 h-8 text-white" />
          </div>
        </div>
        <h1
          class="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          VirtualSnap
        </h1>
        <p class="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
          Transform separate photos into realistic scenes together using AI magic.
        </p>
      </div>

      <!-- Scenario Selector -->
      <ScenarioSelector v-model="selectedScenario" />

      <!-- Upload boxes -->
      <div class="flex flex-col min-[500px]:flex-row gap-4 sm:gap-5 lg:gap-6">
        <div class="flex-1">
          <ImageUpload
            :image-number="1"
            title="First Person"
            :preview="preview1"
            :analysis="analysis1"
            @upload="handleImageUpload"
          />
        </div>

        <div class="flex-1">
          <ImageUpload
            :image-number="2"
            title="Second Person"
            :preview="preview2"
            :analysis="analysis2"
            @upload="handleImageUpload"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 sm:gap-4">
        <!-- Generate Button -->
        <button
          :disabled="!canGenerate || isLoading"
          class="flex-1 bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 text-sm sm:text-base"
          @click="generateImage"
        >
          <SparklesIcon class="w-5 h-5 inline mr-2" />
          {{ generateButtonText }}
        </button>

        <!-- Reset Button -->
        <button
          :disabled="!canReset"
          title="Reset all images"
          class="px-4 sm:px-6 py-3 sm:py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-300 text-sm sm:text-base"
          @click="resetAll"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, computed } from 'vue';
  import { CameraIcon, SparklesIcon } from '@heroicons/vue/24/outline';
  import ImageUpload from '../components/ImageUpload.vue';
  import ScenarioSelector from '../components/ScenarioSelector.vue';
  import { useFileUpload } from '../composables/useFileUpload.js';
  import aiService from '../services/aiService.js';

  export default {
    name: 'HomeView',
    components: {
      ImageUpload,
      ScenarioSelector,
      CameraIcon,
      SparklesIcon,
    },
    emits: ['loading', 'result', 'toast'],
    setup(props, { emit }) {
      const { preview1, preview2, handleImageUpload } = useFileUpload();

      const analysis1 = ref('');
      const analysis2 = ref('');
      const isLoading = ref(false);
      const selectedScenario = ref('car_selfie');

      const canGenerate = computed(() => preview1.value && preview2.value);
      const canReset = computed(() => (preview1.value || preview2.value) && !isLoading.value);

      const generateButtonText = computed(() => {
        const scenario = aiService.getScenarioById(selectedScenario.value);
        return scenario ? `Generate ${scenario.name}` : 'Generate Image';
      });

      const handleUpload = (event, imageNumber) => {
        handleImageUpload(event, imageNumber);
        // Clear previous analysis when new image is uploaded
        if (imageNumber === 1) {
          analysis1.value = '';
        } else {
          analysis2.value = '';
        }
      };

      const generateImage = async () => {
        // Get file references from the DOM
        const fileInput1 = document.getElementById('image-upload-1');
        const fileInput2 = document.getElementById('image-upload-2');
        const file1 = fileInput1?.files[0];
        const file2 = fileInput2?.files[0];

        if (!file1 || !file2) {
          emit('toast', 'Please upload both images.', 'warning');
          return;
        }

        isLoading.value = true;
        emit('loading', true, 'Analyzing models...');

        try {
          const [part1, part2] = await Promise.all([
            aiService.fileToGenerativePart(file1),
            aiService.fileToGenerativePart(file2),
          ]);

          const [analysisResult1, analysisResult2] = await Promise.all([
            aiService.analyzeImage(part1, selectedScenario.value),
            aiService.analyzeImage(part2, selectedScenario.value),
          ]);

          analysis1.value = analysisResult1;
          analysis2.value = analysisResult2;

          emit('loading', true, 'Creating your scene...');

          const resultImage = await aiService.generateImage(
            part1,
            part2,
            analysisResult1,
            analysisResult2,
            selectedScenario.value
          );

          emit('result', resultImage);
        } catch (err) {
          console.error(err);
          emit('toast', err.message || 'Something went wrong. Please try again.', 'error');
        } finally {
          isLoading.value = false;
          emit('loading', false, '');
        }
      };

      const resetAll = () => {
        // Clear previews
        preview1.value = null;
        preview2.value = null;

        // Clear analysis
        analysis1.value = '';
        analysis2.value = '';

        // Clear file inputs
        const fileInput1 = document.getElementById('image-upload-1');
        const fileInput2 = document.getElementById('image-upload-2');
        if (fileInput1) fileInput1.value = '';
        if (fileInput2) fileInput2.value = '';
      };

      return {
        preview1,
        preview2,
        analysis1,
        analysis2,
        isLoading,
        canGenerate,
        canReset,
        selectedScenario,
        generateButtonText,
        handleImageUpload: handleUpload,
        generateImage,
        resetAll,
      };
    },
  };
</script>

<style scoped>
  .disclaimer-tooltip-container:hover .disclaimer-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(-2px);
  }

  .disclaimer-tooltip {
    /* Ensure tooltip appears above other elements */
    z-index: 1000;
    /* Smooth transition */
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease,
      transform 0.2s ease;
    /* Prevent tooltip from being cut off */
    white-space: normal;
    word-wrap: break-word;
  }
</style>
