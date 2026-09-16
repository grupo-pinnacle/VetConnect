/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, '../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-livekit': ['@livekit/components-react', 'livekit-client'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
