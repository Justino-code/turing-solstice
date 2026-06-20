// vite.config.ts

import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['typescript']
  },
  css: {
    devSourcemap: true
  }
});