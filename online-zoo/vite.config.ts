import { defineConfig } from 'vite';
import { resolve } from 'path';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'pages/landing/index.html'),
        map: resolve(__dirname, 'pages/map/index.html'),
        panda: resolve(__dirname, 'pages/zoos/panda.html'),
        eagle: resolve(__dirname, 'pages/zoos/eagle.html'),
        gorilla: resolve(__dirname, 'pages/zoos/gorilla.html'),
        lemur: resolve(__dirname, 'pages/zoos/lemur.html'),
        contact: resolve(__dirname, 'pages/contact/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: '/pages/landing/index.html',
  },
});
