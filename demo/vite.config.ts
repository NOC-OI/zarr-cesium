import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import path from 'path';
import { realpathSync } from 'fs';
import tailwindcss from '@tailwindcss/vite';

// The demo consumes zarr-cesium through `file:..`. Force the linked package and
// all of its dependencies to use the demo's Cesium runtime; separate engine
// singletons leave ContextLimits uninitialized (`maximumTextureSize === 0`).
const demoCesiumPath = realpathSync(path.resolve(__dirname, 'node_modules/cesium'));
const demoCesiumEnginePath = path.resolve(demoCesiumPath, '../@cesium/engine');
const demoCesiumWidgetsPath = path.resolve(demoCesiumPath, '../@cesium/widgets');

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    base: isProd ? '/zarr-cesium/' : '/',
    plugins: [react(), cesium(), tailwindcss()],
    define: {
      CESIUM_BASE_URL: JSON.stringify(isProd ? '/zarr-cesium/zarr-cesium/cesium' : '/cesium')
    },
    optimizeDeps: {
      include: ['@zip.js/zip.js']
    },
    resolve: {
      alias: {
        '@': './src',
        cesium: demoCesiumPath,
        '@cesium/engine': demoCesiumEnginePath,
        '@cesium/widgets': demoCesiumWidgetsPath,
        '@zip.js/zip.js/lib/zip-no-worker.js': path.resolve(
          __dirname,
          'node_modules/@zip.js/zip.js/dist/zip-core.js'
        )
      },
      dedupe: ['cesium', '@cesium/engine', '@cesium/widgets']
    }
  };
});
