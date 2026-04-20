import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isProd = process.env.BUILD_MODE === 'prod'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
  },
})
