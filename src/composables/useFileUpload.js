import { ref } from 'vue';

export function useFileUpload() {
  const preview1 = ref(null);
  const preview2 = ref(null);

  const handleImageUpload = (event, imageNumber) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        if (imageNumber === 1) {
          preview1.value = e.target.result;
        } else {
          preview2.value = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPreviews = () => {
    preview1.value = null;
    preview2.value = null;
  };

  return {
    preview1,
    preview2,
    handleImageUpload,
    resetPreviews,
  };
}
