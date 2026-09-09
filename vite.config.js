import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base path so the build works when served from a GitHub Pages
// project URL (https://<user>.github.io/<repo>/) without any extra config.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
})
