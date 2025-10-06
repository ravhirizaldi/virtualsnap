<template>
  <div>
    <div class="upload-box group relative">
      <label
        :for="`image-upload-${imageNumber}`"
        class="cursor-pointer flex flex-col items-center justify-center w-full h-40 sm:h-48 lg:h-52 p-3 sm:p-4 lg:p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <PhotoIcon
          v-if="!preview"
          class="w-12 h-12 mb-3 text-gray-400 group-hover:text-indigo-600 transition-colors duration-300"
        />
        <span
          v-if="!preview"
          class="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors duration-300"
        >
          {{ title }}
        </span>
        <p
          v-if="!preview"
          class="text-xs sm:text-sm text-gray-500 mt-1 group-hover:text-indigo-600 transition-colors duration-300"
        >
          <ArrowUpTrayIcon class="w-4 h-4 inline mr-1" />
          Click or drop image
        </p>
        <input
          :id="`image-upload-${imageNumber}`"
          :ref="`imageUpload${imageNumber}`"
          type="file"
          class="hidden"
          accept="image/*"
          :aria-label="`Upload ${title.toLowerCase()}`"
          @change="handleUpload"
        >
        <img
          v-if="preview"
          :src="preview"
          class="absolute h-full w-full object-cover rounded-xl"
          :alt="`Preview ${imageNumber}`"
        >
      </label>

      <!-- Analysis Info Overlay -->
      <div
        v-if="preview && analysis"
        class="absolute top-2 right-2 z-10 info-tooltip-container"
      >
        <div class="info-icon-wrapper relative">
          <InformationCircleIcon
            class="w-6 h-6 text-white bg-black bg-opacity-50 rounded-full p-1 cursor-help hover:bg-opacity-70 transition-all duration-200 shadow-lg"
          />
          <!-- Tooltip -->
          <div
            class="tooltip absolute right-0 top-8 w-64 sm:w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible transition-all duration-200 z-20"
          >
            <div class="font-semibold mb-2 flex items-center">
              <SparklesIcon class="w-4 h-4 mr-1.5 text-indigo-400" />
              AI Analysis Result
            </div>
            <div class="text-gray-200 leading-relaxed max-h-32 overflow-y-auto">
              {{ analysis }}
            </div>
            <!-- Arrow -->
            <div class="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    PhotoIcon,
    ArrowUpTrayIcon,
    SparklesIcon,
    InformationCircleIcon,
  } from '@heroicons/vue/24/outline';

  export default {
    name: 'ImageUpload',
    components: {
      PhotoIcon,
      ArrowUpTrayIcon,
      SparklesIcon,
      InformationCircleIcon,
    },
    props: {
      imageNumber: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      preview: {
        type: String,
        default: null,
      },
      analysis: {
        type: String,
        default: '',
      },
    },
    emits: ['upload'],
    methods: {
      handleUpload(event) {
        this.$emit('upload', event, this.imageNumber);
      },
    },
  };
</script>

<style scoped>
  .info-tooltip-container:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(-2px);
  }

  .tooltip {
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

  /* Custom scrollbar for the tooltip content */
  .tooltip div:last-child {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }

  .tooltip div:last-child::-webkit-scrollbar {
    width: 4px;
  }

  .tooltip div:last-child::-webkit-scrollbar-track {
    background: transparent;
  }

  .tooltip div:last-child::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 2px;
  }
</style>
