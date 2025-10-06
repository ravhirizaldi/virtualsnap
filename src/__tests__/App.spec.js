import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { computed, h, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

const toasts = ref([]);
const apiKeyAvailableRef = ref(false);
const hasEnvKeyRef = ref(false);

const mockShowToast = vi.fn();
const mockRemoveToast = vi.fn();
const mockSetApiKey = vi.fn();
const mockValidateApiKey = vi.fn();
const mockClearApiKey = vi.fn();

const createStub = vi.hoisted(() => (name, { props = {}, emits = [] } = {}) => ({
  name,
  props,
  emits,
  render() {
    return h('div', { class: `${name}-stub` }, this.$slots.default?.());
  },
}));

vi.mock('../composables/useToast.js', () => ({
  useToast: () => ({
    toasts,
    showToast: mockShowToast,
    removeToast: mockRemoveToast,
  }),
}));

vi.mock('../composables/useApiKey.js', () => ({
  useApiKey: () => ({
    isApiKeyAvailable: computed(() => apiKeyAvailableRef.value),
    hasEnvironmentApiKey: computed(() => hasEnvKeyRef.value),
    setApiKey: mockSetApiKey,
    validateApiKey: mockValidateApiKey,
    clearApiKey: mockClearApiKey,
  }),
}));

vi.mock('../views/HomeView.vue', () => ({
  default: {
    name: 'HomeView',
    emits: ['loading', 'result', 'toast'],
    render() {
      return h('div', { class: 'home-view-stub' }, this.$slots.default?.());
    },
  },
}));

vi.mock('../components/LoadingSpinner.vue', () => ({
  default: createStub('LoadingSpinner', {
    props: {
      isLoading: {
        type: Boolean,
        default: false,
      },
      loadingText: {
        type: String,
        default: '',
      },
    },
  }),
}));

vi.mock('../components/ResultModal.vue', () => ({
  default: createStub('ResultModal', {
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
  }),
}));

vi.mock('../components/ToastContainer.vue', () => ({
  default: createStub('ToastContainer', {
    props: {
      toasts: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['remove'],
  }),
}));

vi.mock('../components/ApiKeyModal.vue', () => ({
  default: createStub('ApiKeyModal', {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['close', 'save', 'clear'],
  }),
}));

vi.mock('@vercel/speed-insights/vue', () => ({
  SpeedInsights: createStub('SpeedInsights'),
}));

import App from '../App.vue';

describe('App.vue integration behaviour', () => {
  const mountApp = () =>
    mount(App, {
      attachTo: document.body,
    });

  beforeEach(() => {
    toasts.value = [];
    apiKeyAvailableRef.value = false;
    hasEnvKeyRef.value = false;

    mockShowToast.mockReset();
    mockRemoveToast.mockReset();
    mockSetApiKey.mockReset();
    mockValidateApiKey.mockReset();
    mockClearApiKey.mockReset();

    mockValidateApiKey.mockResolvedValue({ valid: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('opens API key modal on mount when no API key is present', async () => {
    const wrapper = mountApp();

    await flushPromises();

    expect(wrapper.vm.showApiKeyModal).toBe(true);
    expect(wrapper.find('.ApiKeyModal-stub').exists()).toBe(true);

    await wrapper.vm.handleApiKeyModalClose();
    expect(mockShowToast).toHaveBeenCalledWith(
      'API key is required to use this application',
      'error'
    );
    expect(wrapper.vm.showApiKeyModal).toBe(false);

    wrapper.unmount();
  });

  it('does not warn when closing modal if API key already exists', async () => {
    apiKeyAvailableRef.value = true;

    const wrapper = mountApp();
    await flushPromises();

    await wrapper.vm.handleApiKeyModalClose();
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(wrapper.vm.showApiKeyModal).toBe(false);

    wrapper.unmount();
  });

  it('saves API key after validation and shows success toast', async () => {
    const wrapper = mountApp();
    await flushPromises();

    await wrapper.vm.handleApiKeySave('AIza-demo-key');

    expect(mockValidateApiKey).toHaveBeenCalledWith('AIza-demo-key');
    expect(mockSetApiKey).toHaveBeenCalledWith('AIza-demo-key');
    expect(mockShowToast).toHaveBeenCalledWith('API key saved successfully!', 'success');
    expect(wrapper.vm.showApiKeyModal).toBe(false);

    wrapper.unmount();
  });

  it('throws when validation fails and keeps modal open', async () => {
    mockValidateApiKey.mockResolvedValue({ valid: false, error: 'Invalid API key' });

    const wrapper = mountApp();
    await flushPromises();

    await expect(wrapper.vm.handleApiKeySave('bad-key')).rejects.toThrow('Invalid API key');
    expect(mockSetApiKey).not.toHaveBeenCalled();
    expect(wrapper.vm.showApiKeyModal).toBe(true);

    wrapper.unmount();
  });

  it('clears API key, notifies user, and re-checks availability', async () => {
    vi.useFakeTimers();
    const wrapper = mountApp();
    await flushPromises();

    await wrapper.vm.handleApiKeyClear();

    expect(mockClearApiKey).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith('API key cleared successfully', 'success');
    expect(wrapper.vm.showApiKeyModal).toBe(false);

    vi.advanceTimersByTime(500);
    await flushPromises();
    expect(wrapper.vm.showApiKeyModal).toBe(true);

    wrapper.unmount();
    vi.useRealTimers();
  });

  it('updates loading state and modal visibility from handlers', async () => {
    const wrapper = mountApp();
    await flushPromises();

    wrapper.vm.handleLoading(true, 'Uploading');
    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.vm.loadingText).toBe('Uploading');

    wrapper.vm.handleResult('data:image/png;base64,xyz');
    expect(wrapper.vm.showModal).toBe(true);
    expect(wrapper.vm.resultImage).toBe('data:image/png;base64,xyz');

    wrapper.vm.closeModal();
    expect(wrapper.vm.showModal).toBe(false);
    expect(wrapper.vm.resultImage).toBeNull();

    wrapper.vm.handleToast('Oops');
    expect(mockShowToast).toHaveBeenCalledWith('Oops', 'error');

    wrapper.unmount();
  });

  it('renders API settings button only when no environment key is set', async () => {
    hasEnvKeyRef.value = false;
    let wrapper = mountApp();
    await flushPromises();
    expect(wrapper.find('button[title="API Key Settings"]').exists()).toBe(true);
    wrapper.unmount();

    hasEnvKeyRef.value = true;
    wrapper = mountApp();
    await flushPromises();
    expect(wrapper.find('button[title="API Key Settings"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
