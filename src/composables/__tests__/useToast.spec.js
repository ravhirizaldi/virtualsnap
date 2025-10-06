import { describe, expect, it, vi } from 'vitest';

import { useToast } from '../useToast.js';

describe('useToast', () => {
  it('adds and removes toasts manually', () => {
    const { toasts, showToast, removeToast } = useToast();

    showToast('Manual dismiss', 'success');

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({ message: 'Manual dismiss', type: 'success' });

    removeToast(toasts.value[0].id);

    expect(toasts.value).toHaveLength(0);
  });

  it('automatically clears toasts after timeout', () => {
    vi.useFakeTimers();
    const { toasts, showToast } = useToast();

    showToast('Temporary message');

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].type).toBe('error');

    vi.advanceTimersByTime(4000);

    expect(toasts.value).toHaveLength(0);

    vi.useRealTimers();
  });
});
