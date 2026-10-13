import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // Prefer TypeScript sources over adjacent generated JavaScript files.
    extensions: ['.mjs', '.mts', '.tsx', '.ts', '.js', '.jsx', '.json'],
  },
})
