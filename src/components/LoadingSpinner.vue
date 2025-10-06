<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6"
  >
    <div class="relative">
      <div class="w-16 h-16 border-4 border-indigo-200 rounded-full" />
      <div
        class="w-16 h-16 border-4 border-t-indigo-600 border-r-purple-600 rounded-full animate-spin absolute top-0 left-0"
      />
    </div>
    <div class="text-center">
      <p class="text-gray-700 font-semibold text-lg mb-1">
        {{ loadingText }}
      </p>
      <div class="flex items-center justify-center space-x-1">
        <SparklesIcon class="w-4 h-4 text-indigo-500 animate-pulse" />
        <span class="text-sm text-gray-500">AI is working its magic</span>
        <SparklesIcon class="w-4 h-4 text-purple-500 animate-pulse" />
      </div>
    </div>
  </div>
</template>

<script>
  import { SparklesIcon } from '@heroicons/vue/24/outline';

  export default {
    name: 'LoadingSpinner',
    components: {
      SparklesIcon,
    },
    props: {
      isLoading: {
        type: Boolean,
        default: false,
      },
      loadingText: {
        type: String,
        default: 'Loading...',
      },
    },
  };
</script>
