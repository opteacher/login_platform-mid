import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import project from './src/jsons/project.json'

// https://vitejs.dev/config/
export default ({ mode }) => defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@lib': fileURLToPath(new URL('./lib/frontend-library/src', import.meta.url))
    }
  },
  server: {
    proxy: {
      [`^/${project.name}/(mdl|api)`]: {
        target: 'http://218.242.30.111:6031',
        changeOrigin: true
      }
    }
  },
  define: {
    'process.env': loadEnv(mode, process.cwd())
  }
})
