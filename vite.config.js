import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { generateSeoHtml } from './seo-plugin.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), generateSeoHtml()],
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
