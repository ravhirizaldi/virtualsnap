<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center w-full h-full bg-black bg-opacity-50 p-4"
    @click="closeModal"
  >
    <div
      class="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Modal content -->
      <div class="relative p-3 sm:p-4 lg:p-5 bg-white rounded-2xl shadow-2xl">
        <!-- Modal header -->
        <div
          class="flex justify-between items-center pb-3 sm:pb-4 mb-3 sm:mb-4 rounded-t border-b border-gray-200"
        >
          <div class="flex items-center">
            <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3">
              <SparklesIcon class="w-5 h-5 text-white" />
            </div>
            <h3
              class="text-lg sm:text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              Your Selfie is Ready!
            </h3>
          </div>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-600 rounded-lg text-sm p-2 ml-auto inline-flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors"
            @click="closeModal"
          >
            <XMarkIcon class="w-5 h-5" />
            <span class="sr-only">Close modal</span>
          </button>
        </div>

        <!-- Modal body -->
        <div class="space-y-3 sm:space-y-4">
          <div class="w-full">
            <img
              v-if="image"
              :src="image"
              alt="Generated image result"
              class="w-full max-h-[60vh] object-contain mx-auto rounded-xl shadow-md"
            >
          </div>

          <a
            v-if="image"
            :href="image"
            :download="`virtualsnap-selfie-${Date.now()}.png`"
            class="w-full inline-flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-5 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            <ArrowDownTrayIcon class="w-5 h-5 mr-2" />
            Download Image
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { XMarkIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/vue/24/outline';

  export default {
    name: 'ResultModal',
    components: {
      XMarkIcon,
      ArrowDownTrayIcon,
      SparklesIcon,
    },
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      image: {
        type: String,
        default: null,
      },
    },
    emits: ['close'],
    methods: {
      closeModal() {
        this.$emit('close');
      },
    },
  };
</script>
