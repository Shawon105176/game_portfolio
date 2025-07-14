import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['three', 'cannon-es', 'gsap', 'stats.js']
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr']
})
