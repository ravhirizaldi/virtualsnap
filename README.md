# VirtualSnap – AI Photo Generator

[![Node.js CI](https://github.com/ravhirizaldi/virtualsnap/actions/workflows/node.js.yml/badge.svg)](https://github.com/ravhirizaldi/virtualsnap/actions/workflows/node.js.yml)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://virtualsnap-rvhrzld.vercel.app/)
[![codecov](https://codecov.io/gh/ravhirizaldi/virtualsnap/branch/main/graph/badge.svg)](https://codecov.io/gh/ravhirizaldi/virtualsnap)

Create photorealistic scenes by blending two selfies into curated scenarios (car selfie, coffee shop, beach trip, and more). VirtualSnap is built with Vue 3, Vite, Tailwind, and Google Gemini.

🚀 **[Live Demo](https://virtualsnap-rvhrzld.vercel.app/)**

---

## Quick start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Provide a Gemini API key**
   ```bash
   cp .env.example .env.local
   echo VITE_GEMINI_API_KEY=your_key_here >> .env.local
   ```
   Or paste it in the in-app modal at first launch (stored in localStorage).
3. **Run locally**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

### Common scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (optimized terser config) |
| `npm run preview` | Preview the production bundle |
| `npm run lint` | ESLint (flat config) |
| `npm run format` | Prettier |
| `npm run test:run` | Vitest + Vue Test Utils suite |

---

## Using the app

1. Launch VirtualSnap and enter a Gemini API key if prompted.
2. Pick a scenario (grid or dropdown view).
3. Upload one photo per person and hit **Generate**.
4. Review the AI suggestions, then download the blended result.

**API key tips**
- Update or clear the stored key via the header key icon.
- Keys live only in the browser (unless supplied via env vars).

---

## Add or tweak scenarios

AI prompts live in `src/prompts/scenarios.json`. Add a new entry like:

```json
{
  "id": "concert_performance",
  "name": "Concert Performance",
  "description": "Create an exciting concert stage performance",
  "icon": "🎤",
  "analysisPrompt": "Describe the outfits only…",
  "mainPrompt": "Create one photorealistic image… {analysis1} … {analysis2} …"
}
```

Guidelines:
- `id` must be unique (snake_case).
- Keep `analysisPrompt` short and focused on clothing/accessories.
- In `mainPrompt`, reuse `{analysis1}` and `{analysis2}` placeholders.
- The UI updates automatically—no code changes required.

---

## Project layout

```
src/
├─ components/       # UI building blocks (modals, uploaders, etc.)
├─ composables/      # Reusable Vue composition logic (toasts, file uploads)
├─ services/         # Google Gemini integration (`aiService.js`)
├─ prompts/          # Scenario definitions (`scenarios.json`)
├─ views/            # Page-level components
└─ main.js / App.vue # App entry point
```

The architecture favours small, testable components. Vitest specs live in `src/components/__tests__/`.

---

## Deployment

### Vercel

1. Push to GitHub and import the repo in Vercel.
2. Set `VITE_GEMINI_API_KEY` in **Settings → Environment Variables**.
3. Deploy (Vercel uses `npm run build`, `dist`, Node 18+).

`vercel.json` already configures SPA routing and caching.

### Docker

Production image uses multi-stage builds with nginx:

```bash
# Build & run
docker-compose up --build

# Development profile (Vite + hot reload)
docker-compose --profile development up --build

# With Traefik proxy
docker-compose --profile production up -d
```

Expose your API key via `.env` (see `.env.example`).

---

## Tech highlights

- Vue 3 + Composition API
- Tailwind CSS for responsive layouts
- Google Gemini SDK integration with local key management
- Vite build pipeline with aggressive terser optimizations
- Fully tested components using Vitest + Vue Test Utils

---

## License

Apache-2.0
