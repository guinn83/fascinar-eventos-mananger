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
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isInStandaloneMode = (window.navigator as any).standalone === true
  const isPWA = isStandalone || (isIOS && isInStandaloneMode)

  return {
    isPWA,
    isStandalone,
    isIOS,
    canInstall: !isPWA && 'serviceWorker' in navigator
  }
}

// Hook para gerenciar instalação do PWA
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      return true
    }
    
    return false
  }

  const hideInstallPrompt = () => {
    setShowInstallPrompt(false)
  }

  return {
    canInstall: !!deferredPrompt,
    showInstallPrompt,
    installPWA,
    hideInstallPrompt
  }
}
