import { describe, expect, it, vi } from 'vitest';

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    createApp: vi.fn(),
  };
});

vi.mock('../App.vue', () => ({
  default: 'MockedAppComponent',
}));

describe('main entry file', () => {
  it('creates and mounts the Vue app exactly once', async () => {
    vi.resetModules();

    const { createApp } = await import('vue');
    const mountMock = vi.fn();
    createApp.mockReturnValue({ mount: mountMock });

    await import('../main.js');

    expect(createApp).toHaveBeenCalledWith('MockedAppComponent');
    expect(mountMock).toHaveBeenCalledWith('#app');
    expect(mountMock).toHaveBeenCalledTimes(1);
  });
});
