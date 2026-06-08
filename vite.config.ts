import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vue(), cloudflare()],
  server: {
    host: '127.0.0.1'
  },
  test: {
    environment: 'node',
    globals: true
  }
});