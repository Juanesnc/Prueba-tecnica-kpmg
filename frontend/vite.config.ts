import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy hacia el backend para evitar problemas de CORS en desarrollo.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
