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
    // Uncomment for HTTPS testing (requires accepting self-signed certificate)
    //https: true as any
  }
})
