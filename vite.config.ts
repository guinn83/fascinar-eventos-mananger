import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react()
    // PWA temporariamente desabilitado para build
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: true,
    allowedHosts: ['fascinar-eventos.loca.lt', '.loca.lt'],
    port: 5173,
    // Improve file-change detection on Windows and networked filesystems (OneDrive)
    watch: {
      usePolling: true,
      interval: 100,
    },
    // Force cache busting for development
    hmr: {
      overlay: true
    },
    // Uncomment for HTTPS testing (requires accepting self-signed certificate)
    //https: true as any
  },
  // Force cache busting in development
  define: {
    __DEV_TIMESTAMP__: JSON.stringify(Date.now())
  }
})
