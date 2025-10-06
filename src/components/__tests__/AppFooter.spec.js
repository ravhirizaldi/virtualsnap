import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppFooter from '../AppFooter.vue';

describe('AppFooter', () => {
  it('renders attribution text', () => {
    const wrapper = mount(AppFooter);
    expect(wrapper.text()).toContain('Created by Ravhi Rizaldi');
  });
});
