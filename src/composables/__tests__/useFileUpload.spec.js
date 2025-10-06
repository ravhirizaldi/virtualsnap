import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ORIGINAL_FILE_READER = globalThis.FileReader;

class MockFileReader {
  constructor() {
    this.onload = null;
  }

  readAsDataURL() {
    if (typeof this.onload === 'function') {
      this.onload({ target: { result: 'data:mock;base64,preview' } });
    }
  }
}

describe('useFileUpload', () => {
  beforeEach(() => {
    globalThis.FileReader = MockFileReader;
  });

  afterEach(() => {
    globalThis.FileReader = ORIGINAL_FILE_READER;
  });

  it('sets the correct preview for the first image', async () => {
    const { useFileUpload } = await import('../useFileUpload.js');
    const { handleImageUpload, preview1 } = useFileUpload();

    const event = {
      target: {
        files: [{}],
      },
    };

    handleImageUpload(event, 1);

    expect(preview1.value).toBe('data:mock;base64,preview');
  });

  it('sets the correct preview for the second image', async () => {
    const { useFileUpload } = await import('../useFileUpload.js');
    const { handleImageUpload, preview2 } = useFileUpload();

    const event = {
      target: {
        files: [{}],
      },
    };

    handleImageUpload(event, 2);

    expect(preview2.value).toBe('data:mock;base64,preview');
  });

  it('ignores empty file selections and supports reset', async () => {
    const { useFileUpload } = await import('../useFileUpload.js');
    const { handleImageUpload, preview1, preview2, resetPreviews } = useFileUpload();

    handleImageUpload({ target: { files: [] } }, 1);

    expect(preview1.value).toBeNull();
    expect(preview2.value).toBeNull();

    handleImageUpload({ target: { files: [{}] } }, 2);
    expect(preview2.value).toBe('data:mock;base64,preview');

    resetPreviews();

    expect(preview1.value).toBeNull();
    expect(preview2.value).toBeNull();
  });
});
