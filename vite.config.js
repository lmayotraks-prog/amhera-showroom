import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Code-splitting: Vite 8 / Rolldown requiere manualChunks como función
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three')) return 'three-core'
          if (id.includes('@react-three')) return 'r3f'
          if (id.includes('postprocessing')) return 'postprocessing'
          if (id.includes('gsap') || id.includes('lenis')) return 'animation'
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
