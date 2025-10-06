import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApiKeyModal from '../ApiKeyModal.vue';

const clearApiKeyMock = vi.fn();

vi.mock('@/composables/useApiKey.js', () => ({
  useApiKey: () => ({
    clearApiKey: clearApiKeyMock,
  }),
}));

describe('ApiKeyModal', () => {
  beforeEach(() => {
    localStorage.clear();
    clearApiKeyMock.mockClear();
  });

  const mountModal = props =>
    mount(ApiKeyModal, {
      props: {
        visible: true,
        ...props,
      },
    });

  it('renders setup guidance when no API key exists', () => {
    const wrapper = mountModal();

    expect(wrapper.text()).toContain('Setup Required');
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('shows update state when key exists and allows clearing', async () => {
    localStorage.setItem('gemini_api_key', 'AIzaExistingKey');

    const wrapper = mountModal();

    expect(wrapper.text()).toContain('Update API Key');

    const clearButton = wrapper.findAll('button').find(button => button.text() === 'Clear Key');

    expect(clearButton).toBeTruthy();

    await clearButton.trigger('click');

    expect(clearApiKeyMock).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('clear')).toBeTruthy();
    expect(wrapper.vm.apiKey).toBe('');
  });

  it('validates API key format before emitting save', async () => {
    const wrapper = mountModal();

    wrapper.vm.apiKey = 'invalid';

    await wrapper.find('form').trigger('submit.prevent');
    await nextTick();

    expect(wrapper.text()).toContain('API key is too short');
    expect(wrapper.emitted('save')).toBeFalsy();

    wrapper.vm.apiKey = 'AIza1234567';
    await wrapper.find('form').trigger('submit.prevent');
    await nextTick();

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0][0]).toBe('AIza1234567');
    expect(wrapper.vm.apiKey).toBe('');
  });
});
