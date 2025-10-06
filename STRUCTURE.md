# VirtualSnap Project Structure

This project has been refactored with a clean directory structure using Vue 3 and Tailwind CSS, featuring multiple scenario-based image generation.

## Directory Structure

```
src/
├── components/          # Reusable Vue components  
│   ├── AppHeader.vue   # Application header/navigation
│   ├── AppFooter.vue   # Application footer
│   ├── ImageUpload.vue # Image upload component
│   ├── ScenarioSelector.vue # Scenario selection component
│   ├── DevModePrompt.vue # Developer mode prompt component
│   ├── LoadingSpinner.vue # Loading spinner component
│   ├── ResultModal.vue # Result display modal
│   └── ToastContainer.vue # Toast notification system
├── views/              # Page-level components
│   └── HomeView.vue    # Main application view
├── composables/        # Vue composables (reusable logic)
│   ├── useFileUpload.js # File upload logic
│   └── useToast.js     # Toast notification logic
├── services/           # API and external service integrators
│   └── aiService.js    # Google Gemini AI with scenario support
├── prompts/            # AI prompt templates
│   └── scenarios.json  # Scenario definitions and prompts
├── assets/             # Static assets
│   └── index.css       # Main stylesheet with Tailwind
├── App.vue             # Root application component
└── main.js             # Application entry point
```

## Key Features

- **Modular Architecture**: Components are split by responsibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vue 3 Composition API**: Modern Vue.js patterns
- **Reusable Composables**: Shared logic extracted into composables
- **Service Layer**: AI functionality abstracted into services
- **Type Safety**: Proper prop validation and emit declarations

## Components Overview

### Components (`src/components/`)
- **AppHeader**: Application navigation and branding
- **AppFooter**: Footer with attribution
- **ImageUpload**: Reusable image upload component with preview
- **ScenarioSelector**: Radio button interface for choosing image scenarios
- **DevModePrompt**: Developer mode for custom prompts
- **LoadingSpinner**: Loading state indicator
- **ResultModal**: Modal for displaying generated results
- **ToastContainer**: Notification system

### Views (`src/views/`)
- **HomeView**: Main application page with scenario selection and image generation

### Composables (`src/composables/`)
- **useFileUpload**: Handles file upload state and logic
- **useToast**: Manages toast notifications

### Services (`src/services/`)
- **aiService**: Handles all AI operations with scenario-based prompt generation

### Prompts (`src/prompts/`)
- **scenarios.json**: Contains all scenario definitions with prompts and metadata

## New Features

- **Multiple Scenarios**: Choose from 6 different photo scenarios
- **Dynamic Prompts**: Each scenario has its own optimized prompt template
- **Flexible Architecture**: Easy to add new scenarios by updating JSON file
- **Radio Button Selection**: Intuitive UI for scenario selection

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```