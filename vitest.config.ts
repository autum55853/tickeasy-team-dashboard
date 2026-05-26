import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    env: {
      NEXT_PUBLIC_FRONTEND_URL: 'https://frontend-amber.onrender.com',
    },
    globals: true,
    exclude: ['node_modules', '.next', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '.next/', 'components/ui/'],
      thresholds: { lines: 80, functions: 80 },
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
