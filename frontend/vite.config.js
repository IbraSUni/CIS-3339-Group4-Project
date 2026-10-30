import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// The '@' alias is built with URL/fileURLToPath instead of require('path') and
// __dirname, so the config is plain ESM and resolves the same way on Windows,
// macOS and Linux.
export default defineConfig({
  plugins: [vue()],
  // Vue's compile-time feature flags. Vue 3.4+ warns in the console when
  // __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ is not defined, and the Vite 3
  // Vue plugin does not define it, so all three are set explicitly.
  // The Options API stays enabled because third-party components
  // (vue-multiselect, vue-toastification) are still written with it.
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
