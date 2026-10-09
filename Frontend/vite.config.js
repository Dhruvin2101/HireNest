import path from "path"
import { fileURLToPath } from 'url'
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Library code goes into separate files from app code. Libraries change rarely, so
// returning visitors keep them cached across deploys and only re-download app code.
const vendorChunk = (id) => {
  if (!id.includes("node_modules")) return undefined
  if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "vendor-react"
  if (/node_modules\/(react-router|react-router-dom)\//.test(id)) return "vendor-router"
  if (/node_modules\/(@reduxjs|redux|react-redux|redux-persist|immer|reselect)\//.test(id)) return "vendor-redux"
  return "vendor"
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
})
