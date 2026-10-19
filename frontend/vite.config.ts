import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
  resolve: {
    // Prefer TypeScript sources over adjacent generated JavaScript files.
    extensions: ['.mjs', '.mts', '.tsx', '.ts', '.js', '.jsx', '.json'],
  },
})
