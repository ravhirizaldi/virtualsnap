import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DevModePrompt from '../DevModePrompt.vue';

describe('DevModePrompt', () => {
  it('emits toggle when button is clicked', async () => {
    const wrapper = mount(DevModePrompt);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('toggle')).toBeTruthy();
  });

  it('emits update:prompt when text changes', async () => {
    const wrapper = mount(DevModePrompt, {
      props: {
        visible: true,
        prompt: 'Initial prompt',
      },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.element.value).toBe('Initial prompt');

    await textarea.setValue('Updated prompt');

    expect(wrapper.emitted('update:prompt')).toBeTruthy();
    expect(wrapper.emitted('update:prompt')[0]).toEqual(['Updated prompt']);
  });
});
