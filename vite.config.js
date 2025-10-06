import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { configDefaults } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [vue()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          passes: 3,
          pure_funcs: ['console.info', 'console.debug', 'console.trace'],
          reduce_funcs: true,
          ecma: 2020,
        },
        mangle: {
          toplevel: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue'],
            ai: ['@google/genai'],
          },
        },
      },
    },
    base: '/',
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: 'tests/setup.js',
      css: true,
      coverage: {
        reporter: ['text', 'lcov'],
        exclude: [...configDefaults.coverage.exclude, 'src/prompts/**'],
      },
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
