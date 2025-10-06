import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

const createStub = vi.hoisted(() => (name, { props = {}, emits = [] } = {}) => ({
  name,
  props,
  emits,
  render() {
    return h('div', { class: `${name}-stub` }, this.$slots.default?.());
  },
}));

const aiServiceMock = vi.hoisted(() => ({
  getScenarioById: vi.fn(),
  fileToGenerativePart: vi.fn(),
  analyzeImage: vi.fn(),
  generateImage: vi.fn(),
}));

vi.mock('../../services/aiService.js', () => ({
  default: aiServiceMock,
}));

vi.mock('../../components/ImageUpload.vue', () => ({
  default: createStub('ImageUpload', {
    props: {
      imageNumber: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        default: '',
      },
      preview: {
        type: String,
        default: null,
      },
      analysis: {
        type: String,
        default: '',
      },
    },
    emits: ['upload'],
  }),
}));

vi.mock('../../components/ScenarioSelector.vue', () => ({
  default: {
    name: 'ScenarioSelector',
    props: {
      modelValue: {
        type: String,
        default: '',
      },
    },
    emits: ['update:modelValue'],
    render() {
      return h('div', { class: 'scenario-selector-stub' }, this.$slots.default?.());
    },
  },
}));

vi.mock('@heroicons/vue/24/outline', () => ({
  CameraIcon: createStub('CameraIcon'),
  SparklesIcon: createStub('SparklesIcon'),
  PhotoIcon: createStub('PhotoIcon'),
  ArrowUpTrayIcon: createStub('ArrowUpTrayIcon'),
  InformationCircleIcon: createStub('InformationCircleIcon'),
}));

import HomeView from '../HomeView.vue';
const originalFileReader = global.FileReader;

beforeAll(() => {
  class InstantFileReader {
    readAsDataURL(file) {
      if (this.onload) {
        this.onload({
          target: {
            result: `data:${file?.type || 'image/png'};base64,stub`,
          },
        });
      }
    }
  }

  global.FileReader = InstantFileReader;
});

afterAll(() => {
  global.FileReader = originalFileReader;
});

describe('HomeView.vue behaviour', () => {
  const createdInputs = [];

  const makeFile = (name = 'image.png') => new File(['binary'], name, { type: 'image/png' });

  const setFiles = (input, files) => {
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: files,
      writable: false,
    });
  };

  const attachFileInput = (id, files = []) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = id;
    setFiles(input, files);
    document.body.appendChild(input);
    createdInputs.push(input);
    return input;
  };

  const mountView = () =>
    mount(HomeView, {
      attachTo: document.body,
    });

  beforeEach(() => {
    aiServiceMock.getScenarioById.mockReset().mockImplementation(() => ({
      id: 'car_selfie',
      name: 'Car Selfie',
      analysisPrompt: 'analysis prompt',
      mainPrompt: 'Together {analysis1} {analysis2}',
    }));

    aiServiceMock.fileToGenerativePart
      .mockReset()
      .mockImplementation(file => Promise.resolve({ inlineData: { data: file.name } }));

    let analyzeCall = 0;
    aiServiceMock.analyzeImage.mockReset().mockImplementation(async () => {
      analyzeCall += 1;
      return analyzeCall === 1 ? 'analysis one' : 'analysis two';
    });

    aiServiceMock.generateImage.mockReset().mockResolvedValue('result-image');
  });

  afterEach(() => {
    createdInputs.splice(0).forEach(input => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    });
    vi.clearAllMocks();
  });

  it('computes button states based on previews', async () => {
    const wrapper = mountView();

    expect(wrapper.vm.canGenerate).toBeFalsy();
    expect(wrapper.vm.canReset).toBeFalsy();

    wrapper.vm.preview1 = 'foo';
    wrapper.vm.preview2 = 'bar';
    await nextTick();

    expect(wrapper.vm.canGenerate).toBe(true);
    expect(wrapper.vm.canReset).toBe(true);

    wrapper.unmount();
  });

  it('loads images and clears prior analysis when uploading', async () => {
    const wrapper = mountView();

    wrapper.vm.analysis1 = 'some analysis';
    wrapper.vm.analysis2 = 'another';

    const uploadEvent = { target: { files: [makeFile()] } };
    wrapper.vm.handleImageUpload(uploadEvent, 1);
    await flushPromises();

    expect(wrapper.vm.preview1).toMatch('data:image/png;base64,stub');
    expect(wrapper.vm.analysis1).toBe('');
    expect(wrapper.vm.analysis2).toBe('another');

    wrapper.vm.handleImageUpload(uploadEvent, 2);
    await flushPromises();
    expect(wrapper.vm.analysis2).toBe('');

    wrapper.unmount();
  });

  it('builds scenario-specific button text', async () => {
    aiServiceMock.getScenarioById.mockReturnValueOnce({
      id: 'custom',
      name: 'Studio Session',
      analysisPrompt: 'prompt',
      mainPrompt: 'prompt {analysis1} {analysis2}',
    });

    const wrapper = mountView();
    await nextTick();

    expect(wrapper.vm.generateButtonText).toBe('Generate Studio Session');

    wrapper.unmount();
  });

  it('emits toast when attempting to generate without both files', async () => {
    attachFileInput('image-upload-1', [makeFile('only.png')]);
    attachFileInput('image-upload-2', []);

    const wrapper = mountView();

    await wrapper.vm.generateImage();

    expect(wrapper.emitted('toast')[0]).toEqual(['Please upload both images.', 'warning']);
    expect(aiServiceMock.fileToGenerativePart).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it('processes files, analyzes images, and emits the generated result', async () => {
    const file1 = makeFile('one.png');
    const file2 = makeFile('two.png');
    attachFileInput('image-upload-1', [file1]);
    attachFileInput('image-upload-2', [file2]);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.vm.generateImage();
    await flushPromises();

    expect(aiServiceMock.fileToGenerativePart).toHaveBeenCalledTimes(2);
    expect(aiServiceMock.analyzeImage).toHaveBeenCalledTimes(2);
    expect(aiServiceMock.generateImage).toHaveBeenCalledWith(
      { inlineData: { data: 'one.png' } },
      { inlineData: { data: 'two.png' } },
      'analysis one',
      'analysis two',
      'car_selfie'
    );

    const loadingEvents = wrapper.emitted('loading');
    expect(loadingEvents[0]).toEqual([true, 'Analyzing models...']);
    expect(loadingEvents.at(-1)).toEqual([false, '']);
    expect(wrapper.emitted('result')[0]).toEqual(['result-image']);

    expect(wrapper.vm.analysis1).toBe('analysis one');
    expect(wrapper.vm.analysis2).toBe('analysis two');
    expect(wrapper.vm.isLoading).toBe(false);

    wrapper.unmount();
  });

  it('resets previews, analyses, and input fields', async () => {
    const input1 = attachFileInput('image-upload-1', [makeFile('cleanup1.png')]);
    const input2 = attachFileInput('image-upload-2', [makeFile('cleanup2.png')]);

    const wrapper = mountView();
    wrapper.vm.preview1 = 'one';
    wrapper.vm.preview2 = 'two';
    wrapper.vm.analysis1 = 'analysis';
    wrapper.vm.analysis2 = 'analysis';

    await wrapper.vm.resetAll();

    expect(wrapper.vm.preview1).toBeNull();
    expect(wrapper.vm.preview2).toBeNull();
    expect(wrapper.vm.analysis1).toBe('');
    expect(wrapper.vm.analysis2).toBe('');
    expect(input1.value).toBe('');
    expect(input2.value).toBe('');

    wrapper.unmount();
  });
});
