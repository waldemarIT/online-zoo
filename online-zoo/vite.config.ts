import { defineConfig } from 'vite';
import { resolve } from 'path';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/online-zoo/',
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
        signin: resolve(__dirname, 'pages/auth/signin.html'),
        register: resolve(__dirname, 'pages/auth/register.html'),
        favourites: resolve(__dirname, 'pages/favourites/index.html'),
        visit: resolve(__dirname, 'pages/visit/index.html'),
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
