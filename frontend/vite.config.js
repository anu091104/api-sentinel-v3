import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // Recharts makes the bundle a bit large; that's fine for this app.
  build: { chunkSizeWarningLimit: 900 },
})
