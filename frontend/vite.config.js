import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// The '@' alias is built with URL/fileURLToPath instead of require('path') and
// __dirname, so the config is plain ESM and resolves the same way on Windows,
// macOS and Linux.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
