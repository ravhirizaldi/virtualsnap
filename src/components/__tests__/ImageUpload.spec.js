import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ImageUpload from '../ImageUpload.vue';

const componentStubs = {
  PhotoIcon: true,
  ArrowUpTrayIcon: true,
  SparklesIcon: true,
  InformationCircleIcon: true,
};

describe('ImageUpload', () => {
  const mountComponent = props =>
    mount(ImageUpload, {
      props: {
        imageNumber: 1,
        title: 'First Image',
        ...props,
      },
      global: {
        stubs: componentStubs,
      },
    });

  it('renders instructions when preview is absent', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('First Image');
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('shows preview image when provided', () => {
    const wrapper = mountComponent({ preview: 'data:image/png;base64,abc' });
    const previewImage = wrapper.find('img');
    expect(previewImage.exists()).toBe(true);
    expect(previewImage.attributes('src')).toBe('data:image/png;base64,abc');
  });

  it('emits upload event with image number on change', () => {
    const wrapper = mountComponent();

    const event = { target: { files: ['file'] } };
    wrapper.vm.handleUpload(event);

    expect(wrapper.emitted('upload')).toBeTruthy();
    const [payloadEvent, payloadNumber] = wrapper.emitted('upload')[0];
    expect(payloadEvent).toEqual(event);
    expect(payloadNumber).toBe(1);
  });
});
