# VirtualSnap - AI Photo Generator

A Vue 3 application that uses Google AI Gemini to combine multiple images and create photorealistic scenes. Choose from various scenarios like car selfies, restaurant dates, beach vacations, and more. Built with modern Vue 3, latest ESLint configuration, and Prettier formatting.

🚀 **[Live Demo](https://virtualsnap-rvhrzld.vercel.app/)** - Try it now!

## Prerequisites

- **[Node.js](https://nodejs.org)** (version 18 or later)
- **Google AI (Gemini) API Key** (get yours [here](https://makersuite.google.com/app/apikey))

## Setup Instructions

1. **Clone or download** this project to your local machine.
2. **Open a terminal** in this project directory.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **API Key Setup** - You have two options:
   
   **Option A: Environment Variable (recommended for development)**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   **Option B: In-App Setup (user-friendly)**
   If no API key is found in the environment, the app will show a popup when first opened, allowing users to enter their personal API key. The key is stored locally in the browser and never shared.

   > **⚠️ Important**: Keep your API key secure and never commit it to version control.

5. **Start the development server**:
   ```bash
   npm run dev
   ```
6. **Open your browser** and go to `http://localhost:3000`

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

## Usage

1. **API Key Setup**: If no API key is configured, a popup will appear asking for your personal Gemini API key
2. **Choose a scenario** from the available options (Car Selfie, Restaurant Date, Beach Vacation, etc.)
3. **Upload two images** using the file inputs for "First Person" and "Second Person"
4. **Click the generate button** to create a combined image in your chosen scenario
5. **Download your generated image** when the AI completes processing

## API Key Management

- **First Time Setup**: Enter your Gemini API key when prompted - it's stored securely in your browser
- **Change API Key**: Click the key icon in the header to update or change your API key
- **Clear API Key**: Use the "Clear Key" button in the settings modal to remove your stored key
- **Privacy**: Your API key is stored locally in your browser and never sent to any external servers except Google's Gemini API

## Available Scenarios

- 🚗 **Car Selfie** - Create a realistic car selfie with both people
- 🍽️ **Restaurant Date** - Generate an elegant dinner scene
- 🏖️ **Beach Vacation** - Create a fun beach vacation photo
- ☕ **Coffee Shop Meeting** - Generate a casual coffee shop encounter
- 💒 **Wedding Photo** - Create an elegant formal event photo
- 🥾 **Hiking Adventure** - Generate an outdoor hiking scene

## Features

- ✨ Built with Vue 3 Composition API
- 🔧 Latest ESLint 9.x configuration with flat config
- 💅 Prettier for consistent code formatting
- 🖼️ Real-time image preview and analysis
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern Vue 3 reactive components
- 🔧 Developer mode for custom prompts
- 📥 Easy image download functionality
- � In-app API key management (store personal keys locally)
- ⚙️ Settings panel for API key configuration
- �🚀 Fast development with Vite

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Google AI Gemini** - AI-powered image generation
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint 9.x** - Latest linting with flat config
- **Prettier** - Code formatting
- **JavaScript (ES2022+)** - Modern JavaScript features

## Vercel Deployment

This project is fully configured for deployment on Vercel. Follow these steps:

### Quick Deploy

1. **Fork this repository** or upload it to your GitHub account
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project" and import your repository

3. **Configure Environment Variables**:
   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add the following variable:
     ```
     Name: VITE_GEMINI_API_KEY
     Value: your_actual_gemini_api_key_here
     ```

4. **Deploy**: Vercel will automatically build and deploy your project!

### Manual Configuration

The project includes these Vercel-specific files:
- `vercel.json` - Vercel configuration with SPA routing
- `.vercelignore` - Files to exclude from deployment
- Updated `vite.config.js` with optimized build settings

### Environment Variables for Vercel

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `NODE_ENV` | Set to "production" for production builds | Optional |

### Build Configuration

The project uses:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Node.js Version**: 18.x or later

### Features Optimized for Vercel

- ✅ SPA routing with fallback to index.html
- ✅ Optimized asset caching headers
- ✅ Environment variable support
- ✅ Automatic dependency detection
- ✅ Edge-optimized build configuration

## License

This project is licensed under the Apache-2.0 License.
