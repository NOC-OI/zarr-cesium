import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    base: isProd ? '/zarr-cesium/' : '/',
    plugins: [react(), cesium(), tailwindcss()],
    define: {
      CESIUM_BASE_URL: JSON.stringify(isProd ? '/zarr-cesium/zarr-cesium/cesium' : '/cesium')
    },
    resolve: {
      alias: {
        '@': './src',
        '@zip.js/zip.js/lib/zip-no-worker.js': path.resolve(
          __dirname,
          'node_modules/@zip.js/zip.js/dist/zip-core.js'
        )
      }
    },
    optimizeDeps: {
      include: ['@zip.js/zip.js']
    }
  };
});
