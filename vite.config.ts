import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [vue()],
  resolve: {
    alias: {
      find: './runtimeConfig',
      replacement: './runtimeConfig.browser',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      "./runtimeConfig": "./runtimeConfig.browser", //fix production build
    },
  },
})
