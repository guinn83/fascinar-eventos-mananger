import { useEffect, useRef, useState } from 'react'

// Hook para gerenciar janelas PWA e detecção de foco
export const usePWAWindowManager = () => {
  const windowId = useRef(Math.random().toString(36).substr(2, 9))

  useEffect(() => {
    // Registrar esta instância da janela
    const registerWindow = () => {
      const windows = JSON.parse(localStorage.getItem('fascinar-app-windows') || '[]')
      const newWindows = windows.filter((w: any) => Date.now() - w.timestamp < 30000) // Limpar janelas antigas
      
      newWindows.push({
        id: windowId.current,
        timestamp: Date.now(),
        url: window.location.href
      })
      
      localStorage.setItem('fascinar-app-windows', JSON.stringify(newWindows))
    }

    // Atualizar timestamp periodicamente para manter a janela "viva"
    const updateTimestamp = () => {
      registerWindow()
    }

    // Registrar janela inicial
    registerWindow()

    // Atualizar a cada 10 segundos
    const interval = setInterval(updateTimestamp, 10000)

    // Limpar quando a janela fechar
    const cleanup = () => {
      const windows = JSON.parse(localStorage.getItem('fascinar-app-windows') || '[]')
      const filteredWindows = windows.filter((w: any) => w.id !== windowId.current)
      localStorage.setItem('fascinar-app-windows', JSON.stringify(filteredWindows))
    }

    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)

    return () => {
      clearInterval(interval)
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
      window.removeEventListener('unload', cleanup)
    }
  }, [])

  // Função para verificar se há outras janelas abertas
  const hasOtherWindows = () => {
    const windows = JSON.parse(localStorage.getItem('fascinar-app-windows') || '[]')
    const activeWindows = windows.filter((w: any) => 
      Date.now() - w.timestamp < 30000 && w.id !== windowId.current
    )
    return activeWindows.length > 0
  }

  // Função para focar em janela existente (se houver)
  const focusExistingWindow = () => {
    if (hasOtherWindows()) {
      // Tentar focar usando postMessage para outras abas
      const channel = new BroadcastChannel('fascinar-app-focus')
      channel.postMessage({ type: 'FOCUS_REQUEST', from: windowId.current })
      
      // Fechar esta janela após um tempo
      setTimeout(() => {
        window.close()
      }, 1000)
      
      return true
    }
    return false
  }

  // Escutar mensagens de outras abas
  useEffect(() => {
    const channel = new BroadcastChannel('fascinar-app-focus')
    
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'FOCUS_REQUEST' && event.data.from !== windowId.current) {
        // Focar nesta janela
        window.focus()
        
        // Responder que focamos
        channel.postMessage({ 
          type: 'FOCUS_RESPONSE', 
          from: windowId.current, 
          to: event.data.from 
        })
      }
    })

    return () => {
      channel.close()
    }
  }, [])

  return {
    windowId: windowId.current,
    hasOtherWindows,
    focusExistingWindow
  }
}

// Hook para detectar se o app foi instalado como PWA
export const usePWADetection = () => {
  // Verificações de segurança
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isPWA: false,
      isStandalone: false,
      isIOS: false,
      canInstall: false,
      debugInfo: { error: 'Browser environment not available' }
    }
  }

  let isStandalone = false
  let isIOS = false
  let isInStandaloneMode = false

  try {
    isStandalone = window.matchMedia('(display-mode: standalone)').matches
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    isInStandaloneMode = (window.navigator as any).standalone === true
  } catch (error) {
    console.warn('[PWA Detection] Error detecting PWA status:', error)
  }

  const isPWA = isStandalone || (isIOS && isInStandaloneMode)

  // Debug PWA detection
  const debugInfo = {
    userAgent: navigator.userAgent,
    isStandalone,
    isIOS,
    isInStandaloneMode,
    isPWA,
    hasServiceWorker: 'serviceWorker' in navigator,
    isSecureContext: window.isSecureContext,
    displayMode: (() => {
      try {
        return window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 
               window.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
               window.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' : 'browser'
      } catch {
        return 'unknown'
      }
    })()
  }

  // Log debug info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[PWA Detection]', debugInfo)
  }

  return {
    isPWA,
    isStandalone,
    isIOS,
    canInstall: !isPWA && 'serviceWorker' in navigator,
    debugInfo
  }
}

// Hook para gerenciar instalação do PWA
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isPromptDismissed, setIsPromptDismissed] = useState(false)

  useEffect(() => {
    // Verificações de segurança
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      // Verificar se o usuário já rejeitou o prompt
      const dismissedTime = localStorage.getItem('pwa-install-dismissed')
      const now = Date.now()
      const oneWeek = 7 * 24 * 60 * 60 * 1000 // 1 semana em millisegundos
      
      if (dismissedTime && (now - parseInt(dismissedTime)) < oneWeek) {
        setIsPromptDismissed(true)
        return
      }

      const handler = (e: any) => {
        try {
          e.preventDefault()
          setDeferredPrompt(e)
          if (!isPromptDismissed) {
            setShowInstallPrompt(true)
          }
        } catch (error) {
          console.warn('[PWA Install] Error handling beforeinstallprompt:', error)
        }
      }

      window.addEventListener('beforeinstallprompt', handler)

      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
      }
    } catch (error) {
      console.warn('[PWA Install] Error setting up install prompt:', error)
    }
  }, [isPromptDismissed])

  const installPWA = async () => {
    if (!deferredPrompt) {
      console.warn('[PWA Install] No deferred prompt available')
      return false
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('[PWA Install] User choice:', outcome)
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('pwa-install-dismissed')
        }
        console.log('[PWA Install] Installation accepted')
        return true
      } else {
        // Se o usuário rejeitou, lembrar por 1 semana
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pwa-install-dismissed', Date.now().toString())
        }
        setIsPromptDismissed(true)
        setShowInstallPrompt(false)
        console.log('[PWA Install] Installation dismissed')
      }
    } catch (error) {
      console.error('[PWA Install] Error during installation:', error)
    }
    
    return false
  }

  const hideInstallPrompt = () => {
    try {
      // Salvar que o usuário dispensou o prompt por 1 semana
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
      }
      setIsPromptDismissed(true)
      setShowInstallPrompt(false)
    } catch (error) {
      console.warn('[PWA Install] Error hiding install prompt:', error)
    }
  }

  return {
    canInstall: !!deferredPrompt,
    showInstallPrompt: showInstallPrompt && !isPromptDismissed,
    installPWA,
    hideInstallPrompt,
    isPromptDismissed
  }
}
