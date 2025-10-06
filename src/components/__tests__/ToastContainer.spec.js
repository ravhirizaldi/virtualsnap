import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ToastContainer from '../ToastContainer.vue';

const stubs = {
  XCircleIcon: true,
  ExclamationTriangleIcon: true,
  CheckCircleIcon: true,
};

describe('ToastContainer', () => {
  const sampleToasts = [
    { id: 1, type: 'error', message: 'Error occurred' },
    { id: 2, type: 'success', message: 'Success!' },
  ];

  it('renders each toast message', () => {
    const wrapper = mount(ToastContainer, {
      props: { toasts: sampleToasts },
      global: { stubs },
    });

    expect(wrapper.text()).toContain('Error occurred');
    expect(wrapper.text()).toContain('Success!');
  });

  it('emits remove when toast is clicked', async () => {
    const wrapper = mount(ToastContainer, {
      props: { toasts: sampleToasts },
      global: { stubs },
    });

    const firstToast = wrapper.findAll('.flex.items-center.w-full').at(0);
    expect(firstToast).toBeTruthy();

    await firstToast.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')[0]).toEqual([1]);
  });
});
