<template>
  <div class="space-y-2">
    <div class="text-center">
      <button
        class="text-xs text-blue-600 hover:underline focus:outline-none"
        @click="toggleDevMode"
      >
        Toggle Dev Mode
      </button>
    </div>

    <div v-if="visible">
      <label
        for="prompt-input"
        class="text-xs sm:text-sm font-semibold text-gray-700"
      >
        Prompt (Dev Mode)
      </label>
      <textarea
        id="prompt-input"
        :value="prompt"
        rows="6"
        class="mt-1 w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white text-black focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px] max-h-[300px] sm:min-h-[150px]"
        @input="updatePrompt"
      />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'DevModePrompt',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      prompt: {
        type: String,
        default: '',
      },
    },
    emits: ['toggle', 'update:prompt'],
    methods: {
      toggleDevMode() {
        this.$emit('toggle');
      },
      updatePrompt(event) {
        this.$emit('update:prompt', event.target.value);
      },
    },
  };
</script>
