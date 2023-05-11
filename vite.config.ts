import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      /* Avoid hash in file names
      https://rollupjs.org/configuration-options/#output-assetfilenames */
      // output: {
      //   entryFileNames: `assets/[name].[hash].js`,
      //   chunkFileNames: `assets/[name].[hash].js`,
      //   assetFileNames: `assets/[name].[hash].[ext]`
      // }
      /* -------------------------------------------------------------- */
    }
  }
});