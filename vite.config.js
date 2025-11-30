import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necesario para Docker
    port: 5173, 
    watch: {
      usePolling: true, // A veces necesario en Windows/WSL para detectar cambios
    },
  },
})