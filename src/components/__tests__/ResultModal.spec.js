import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ResultModal from '../ResultModal.vue';

const stubs = {
  XMarkIcon: true,
  ArrowDownTrayIcon: true,
  SparklesIcon: true,
};

describe('ResultModal', () => {
  const mountModal = props =>
    mount(ResultModal, {
      props: {
        visible: true,
        image: 'data:image/png;base64,abc',
        ...props,
      },
      global: {
        stubs,
      },
    });

  it('renders generated image and download link when visible', () => {
    const wrapper = mountModal();

    const image = wrapper.find('img');
    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('data:image/png;base64,abc');

    const downloadLink = wrapper.find('a');
    expect(downloadLink.exists()).toBe(true);
    expect(downloadLink.attributes('href')).toBe('data:image/png;base64,abc');
    expect(downloadLink.attributes('download')).toMatch(/virtualsnap-selfie-.*\.png$/);
  });

  it('emits close when overlay or button is triggered', async () => {
    const wrapper = mountModal();

    await wrapper.find('.fixed.inset-0').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('close').length).toBeGreaterThan(1);
  });
});
