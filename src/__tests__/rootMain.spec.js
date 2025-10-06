import { describe, expect, it, vi } from 'vitest';

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    createApp: vi.fn(),
  };
});

vi.mock('../../src/App.vue', () => ({
  default: 'MockedRootApp',
}));

vi.mock('../../src/assets/index.css', () => ({}), { virtual: true });

describe('root main entry file', () => {
  it('mounts the Vue application once at the root', async () => {
    vi.resetModules();

    const { createApp } = await import('vue');
    const mountMock = vi.fn();
    createApp.mockReturnValue({ mount: mountMock });

    await import('../../main.js');

    expect(createApp).toHaveBeenCalledWith('MockedRootApp');
    expect(mountMock).toHaveBeenCalledWith('#app');
    expect(mountMock).toHaveBeenCalledTimes(1);
  });
});
