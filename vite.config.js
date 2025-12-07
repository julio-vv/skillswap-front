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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar MUI core para mejor caching
          'mui-core': [
            '@mui/material',
            '@mui/material/styles',
            '@mui/material/Box',
            '@mui/material/Button',
            '@mui/material/Card',
            '@mui/material/TextField',
          ],
          // Icons en chunk separado
          'mui-icons': ['@mui/icons-material'],
          // Dependencias principales
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // Form libraries
          'form': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          // HTTP client
          'http': ['axios'],
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Mejores tamaños de chunks
    chunkSizeWarningLimit: 600,
    // Minify más agresivamente
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})