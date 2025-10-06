<template>
  <div
    class="fixed top-3 sm:top-5 right-3 sm:right-5 z-[100] space-y-2 sm:space-y-3 w-full max-w-xs"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'flex items-center w-full max-w-xs p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-sm',
        toast.type === 'error'
          ? 'bg-red-50/90 text-red-600 border border-red-200 hover:bg-red-100/90'
          : '',
        toast.type === 'warning'
          ? 'bg-yellow-50/90 text-yellow-600 border border-yellow-200 hover:bg-yellow-100/90'
          : '',
        toast.type === 'success'
          ? 'bg-green-50/90 text-green-600 border border-green-200 hover:bg-green-100/90'
          : '',
      ]"
      @click="$emit('remove', toast.id)"
    >
      <!-- Toast Icons -->
      <XCircleIcon
        v-if="toast.type === 'error'"
        class="w-5 h-5 flex-shrink-0"
      />
      <ExclamationTriangleIcon
        v-if="toast.type === 'warning'"
        class="w-5 h-5 flex-shrink-0"
      />
      <CheckCircleIcon
        v-if="toast.type === 'success'"
        class="w-5 h-5 flex-shrink-0"
      />

      <div class="ml-3 text-xs sm:text-sm font-normal">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
  import { XCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/vue/24/solid';

  export default {
    name: 'ToastContainer',
    components: {
      XCircleIcon,
      ExclamationTriangleIcon,
      CheckCircleIcon,
    },
    props: {
      toasts: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['remove'],
  };
</script>
