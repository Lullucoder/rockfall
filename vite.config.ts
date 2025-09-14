import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // listen on 0.0.0.0
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          maps: ['leaflet', 'react-leaflet'],
          ai: ['@google/generative-ai'],
          charts: ['recharts'],
          utils: ['date-fns', 'papaparse']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  preview: {
    port: 4173,
    host: true
  },
  define: {
    // Make sure process.env is available in production builds
    'process.env': {}
  }
});
