import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScenarioSelector from '../ScenarioSelector.vue';

const baseScenarios = [
  {
    id: 'car_selfie',
    name: 'Car Selfie',
    description: 'Cruise in style.',
    icon: '🚗',
  },
  {
    id: 'city_lights',
    name: 'City Lights',
    description: 'Night skyline glow.',
    icon: '🌃',
  },
  {
    id: 'latex_bedroom',
    name: 'Hidden Scenario',
    description: 'Secret content.',
    icon: '🛏️',
  },
];

const extendedScenarios = [
  ...baseScenarios,
  { id: 'retro_arcade', name: 'Retro Arcade', description: 'Neon nostalgia.', icon: '🕹️' },
  { id: 'beach_day', name: 'Beach Day', description: 'Sunny escape.', icon: '🏖️' },
  { id: 'mountain_peak', name: 'Mountain Peak', description: 'High altitude.', icon: '🏔️' },
  { id: 'forest_trail', name: 'Forest Trail', description: 'Nature vibes.', icon: '🌲' },
  { id: 'space_station', name: 'Space Station', description: 'Zero gravity.', icon: '🛰️' },
  { id: 'underwater', name: 'Underwater', description: 'Ocean depths.', icon: '🐠' },
  { id: 'desert_dusk', name: 'Desert Dusk', description: 'Golden hour.', icon: '🏜️' },
];

const mockGetScenarios = vi.fn();

vi.mock('@/services/aiService.js', () => ({
  default: {
    getScenarios: (...args) => mockGetScenarios(...args),
  },
}));

describe('ScenarioSelector', () => {
  beforeEach(() => {
    mockGetScenarios.mockReturnValue(baseScenarios);
  });

  it('filters locked scenarios and emits updates in grid view', async () => {
    const wrapper = mount(ScenarioSelector, {
      props: {
        secretUnlocked: false,
        modelValue: 'car_selfie',
      },
    });

    await nextTick();

    expect(wrapper.text()).not.toContain('Hidden Scenario');

    const cards = wrapper.findAll('.grid > div');
    expect(cards.length).toBe(2);

    await cards[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['city_lights']);

    await wrapper.setProps({ modelValue: 'city_lights' });
    expect(wrapper.vm.selectedScenario).toBe('city_lights');
  });

  it('switches to dropdown view automatically when scenarios grow', async () => {
    mockGetScenarios.mockReturnValue(extendedScenarios);

    const wrapper = mount(ScenarioSelector, {
      props: {
        secretUnlocked: true,
        modelValue: 'car_selfie',
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.vm.viewMode).toBe('dropdown');

    const select = wrapper.find('select');
    expect(select.exists()).toBe(true);

    await select.setValue('retro_arcade');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['retro_arcade']);
  });
});
