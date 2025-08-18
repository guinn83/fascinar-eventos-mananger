import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import './index.css'
import './debug.css'

// Add debug timestamp to body
document.body.setAttribute('data-css-version', Date.now().toString())

// Development helper: unregister any service workers and clear caches so
// the browser doesn't serve stale PWA assets while you're actively editing.
// This runs only in Vite's dev mode (import.meta.env.DEV).
if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) {
  ;(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        for (const r of regs) {
          try { await r.unregister() } catch { /* ignore */ }
          console.log('[DEV] Unregistered service worker:', r.scope)
        }
        // navigator.serviceWorker.ready may reject if no SW is active — ignore.
        try {
          const ready = await navigator.serviceWorker.ready
  try { await ready.unregister() } catch { /* ignore */ }
  } catch { /* ignore */ }
      }

      if (typeof caches !== 'undefined' && caches.keys) {
        const keys = await caches.keys()
        await Promise.all(keys.map(k => caches.delete(k)))
        console.log('[DEV] Cleared Cache Storage keys:', keys)
      }
    } catch (err) {
      console.warn('[DEV] Failed to fully clear PWA caches:', err)
    }
  })()
}

// Registrar Service Worker para PWA - TEMPORARILY DISABLED FOR DEVELOPMENT
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('[SW] Registered successfully:', registration.scope)
//       })
//       .catch((error) => {
//         console.log('[SW] Registration failed:', error)
//       })
//   })
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
