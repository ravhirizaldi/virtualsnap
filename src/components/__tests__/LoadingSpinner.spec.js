import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LoadingSpinner from '../LoadingSpinner.vue';

describe('LoadingSpinner', () => {
  it('does not render spinner when loading is false', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        isLoading: false,
      },
      global: {
        stubs: {
          SparklesIcon: true,
        },
      },
    });

    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('renders loading message when active', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        isLoading: true,
        loadingText: 'Generating...',
      },
      global: {
        stubs: {
          SparklesIcon: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Generating...');
    expect(wrapper.findComponent({ name: 'SparklesIcon' })).toBeTruthy();
  });
});
