<template>
  <div class="space-y-4">
    <div class="text-center">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Choose Your Scene</h3>
      <p class="text-sm text-gray-600">Select the type of photo you want to create</p>
    </div>

    <!-- View Toggle -->
    <div class="flex justify-center mb-4">
      <div class="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <button
          :class="[
            'px-3 py-1 text-sm font-medium rounded-md transition-all duration-200',
            viewMode === 'grid'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800',
          ]"
          @click="viewMode = 'grid'"
        >
          Grid View
        </button>
        <button
          :class="[
            'px-3 py-1 text-sm font-medium rounded-md transition-all duration-200',
            viewMode === 'dropdown'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800',
          ]"
          @click="viewMode = 'dropdown'"
        >
          Compact View
        </button>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="space-y-4">
      <!-- Show first 6 scenarios by default -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="scenario in displayedScenarios"
          :key="scenario.id"
          :class="getScenarioClasses(scenario.id)"
          @click="selectScenario(scenario.id)"
        >
          <!-- Radio button indicator -->
          <div class="absolute top-3 right-3">
            <div
              :class="[
                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                selectedScenario === scenario.id
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-gray-300',
              ]"
            >
              <div v-if="selectedScenario === scenario.id" class="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          <!-- Scenario content -->
          <div class="text-center">
            <div class="text-2xl mb-2">
              {{ scenario.icon }}
            </div>
            <h4 class="font-semibold text-gray-800 text-sm mb-1">
              {{ scenario.name }}
            </h4>
            <p class="text-xs text-gray-600 leading-relaxed">
              {{ scenario.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Show More/Less Button -->
      <div v-if="filteredScenarios.length > 6" class="text-center">
        <button
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
          @click="showAllScenarios = !showAllScenarios"
        >
          {{ showAllScenarios ? 'Show Less' : `Show All ${filteredScenarios.length} Scenarios` }}
          <svg
            :class="[
              'ml-2 w-4 h-4 transition-transform duration-200',
              showAllScenarios ? 'rotate-180' : '',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Dropdown View -->
    <div v-else class="space-y-3">
      <!-- Selected Scenario Display -->
      <div :class="getScenarioClasses(selectedScenario, true)" class="mb-4">
        <div class="text-center">
          <div class="text-3xl mb-2">
            {{ getSelectedScenario()?.icon }}
          </div>
          <h4 class="font-semibold text-gray-800 mb-1">
            {{ getSelectedScenario()?.name }}
          </h4>
          <p class="text-sm text-gray-600 leading-relaxed">
            {{ getSelectedScenario()?.description }}
          </p>
        </div>
      </div>

      <!-- Dropdown Selector -->
      <div class="relative">
        <select
          v-model="selectedScenario"
          class="w-full p-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
        >
          <option v-for="scenario in filteredScenarios" :key="scenario.id" :value="scenario.id">
            {{ scenario.icon }} {{ scenario.name }}
          </option>
        </select>
        <!-- Custom dropdown arrow -->
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import aiService from '../services/aiService.js';

  export default {
    name: 'ScenarioSelector',
    props: {
      modelValue: {
        type: String,
        default: 'car_selfie',
      },
      secretUnlocked: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        scenarios: [],
        viewMode: 'grid', // 'grid' or 'dropdown'
        showAllScenarios: false,
      };
    },
    computed: {
      selectedScenario: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
        },
      },
      filteredScenarios() {
        // Filter out latex_bedroom scenario unless unlocked
        return this.scenarios.filter(scenario => {
          if (scenario.id === 'latex_bedroom') {
            return this.secretUnlocked;
          }
          return true;
        });
      },
      displayedScenarios() {
        if (this.showAllScenarios) {
          return this.filteredScenarios;
        }
        return this.filteredScenarios.slice(0, 6); // Show first 6 scenarios by default
      },
    },
    watch: {
      filteredScenarios: {
        handler(newScenarios) {
          // Switch to dropdown view automatically if there are more than 8 scenarios
          if (newScenarios.length > 8) {
            this.viewMode = 'dropdown';
          }
        },
        immediate: true,
      },
    },
    mounted() {
      this.scenarios = aiService.getScenarios();
    },
    methods: {
      selectScenario(scenarioId) {
        this.selectedScenario = scenarioId;
      },
      getScenarioClasses(scenarioId, isSelected = false) {
        const baseClasses =
          'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md';
        if (this.selectedScenario === scenarioId || isSelected) {
          return `${baseClasses} border-indigo-500 shadow-md bg-indigo-50`;
        }
        return `${baseClasses} border-gray-200 hover:border-indigo-300`;
      },
      getSelectedScenario() {
        return this.scenarios.find(s => s.id === this.selectedScenario);
      },
    },
  };
</script>
