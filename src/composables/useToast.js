import { ref } from 'vue';

export function useToast() {
  const toasts = ref([]);
  const toastIdCounter = ref(0);

  const showToast = (message, type = 'error') => {
    const id = ++toastIdCounter.value;
    const toast = { id, message, type };
    toasts.value.push(toast);

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, 4000);
  };

  const removeToast = id => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
}
