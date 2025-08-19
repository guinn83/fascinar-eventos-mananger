import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'

// PWA Install Prompt simplificado e seguro
const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [swStatus, setSwStatus] = useState<'none' | 'registered' | 'controlling' | 'error'>('none')

  // Verificações de segurança
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined'
  
  if (!isBrowser) return null

  // Estado de instalação PWA
  const isPWA = isBrowser && window.matchMedia('(display-mode: standalone)').matches
  const isPromptDismissed = isBrowser && localStorage.getItem('pwa-install-dismissed')
  
  // User engagement simples
  const isUserEngaged = isBrowser && localStorage.getItem('user-engaged') === 'true'
  const timeRequirementMet = isBrowser && localStorage.getItem('engagement-time-met') === 'true'
  
  // Não mostrar se já instalado ou dispensado
  if (isPWA || isPromptDismissed) return null
  
  // Detecção de navegador
  const userAgent = isBrowser ? navigator.userAgent : ''
  const isAndroid = /Android/.test(userAgent)
  const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent)
  const isEdge = /Edg/.test(userAgent)
  const isSamsung = /SamsungBrowser/.test(userAgent)
  const isChromiumAndroid = isAndroid && (isChrome || isEdge || isSamsung)

  // Service Worker status check
  useEffect(() => {
    if (!isBrowser || !('serviceWorker' in navigator)) {
      setSwStatus('error')
      return
    }

    navigator.serviceWorker.getRegistration()
      .then((reg) => {
        if (reg) {
          setSwStatus(navigator.serviceWorker.controller ? 'controlling' : 'registered')
        } else {
          setSwStatus('none')
        }
      })
      .catch(() => {
        setSwStatus('error')
      })
  }, [isBrowser])

  // User engagement tracking
  useEffect(() => {
    if (!isBrowser) return

    // Track session start
    if (!localStorage.getItem('session-start')) {
      localStorage.setItem('session-start', Date.now().toString())
    }

    // Track user interactions
    const handleInteraction = () => {
      localStorage.setItem('user-engaged', 'true')
      localStorage.setItem('last-interaction', Date.now().toString())
    }

    // Track time spent (30 seconds minimum)
    const timeTracker = setInterval(() => {
      const sessionStart = parseInt(localStorage.getItem('session-start') || '0')
      const timeSpent = Date.now() - sessionStart
      
      if (timeSpent >= 30000) {
        localStorage.setItem('engagement-time-met', 'true')
        clearInterval(timeTracker)
      }
    }, 1000)

    // Add event listeners
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true })
    })

    return () => {
      clearInterval(timeTracker)
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }, [isBrowser])

  // beforeinstallprompt handling
  useEffect(() => {
    if (!isBrowser) return

    let deferredPrompt: any = null

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      deferredPrompt = e
      
      // Only show if user is engaged and time requirement is met
      if (isUserEngaged && timeRequirementMet) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Make install function available globally for manual trigger
    const installPWA = async () => {
      if (!deferredPrompt) return false

      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          setShowPrompt(false)
          localStorage.removeItem('pwa-install-dismissed')
          return true
        } else {
          hidePrompt()
        }
      } catch (error) {
        console.error('[PWA] Install error:', error)
      }
      
      return false
    }

    ;(window as any).installPWA = installPWA

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isBrowser, isUserEngaged, timeRequirementMet])

  const hidePrompt = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  const handleInstall = async () => {
    if ((window as any).installPWA) {
      await (window as any).installPWA()
    }
  }

  // Show fallback for Android without native prompt
  const shouldShowFallback = isChromiumAndroid && !showPrompt && isUserEngaged && timeRequirementMet
  const shouldShowAny = showPrompt || shouldShowFallback

  if (!shouldShowAny) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="bg-surface border border-border rounded-2xl shadow-lg">
        <CardContent size="md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-download text-primary"></i>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text mb-1">Instalar App</h3>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-secondary">Instale o Fascinar Eventos para acesso mais rápido e notificações.</p>
                <div className="text-xs">
                  {(() => {
                    switch (swStatus) {
                      case 'controlling':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-success text-white">Ativo</span>
                      case 'registered':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-warning text-white">Registrado</span>
                      case 'none':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-surface text-text">Não registrado</span>
                      case 'error':
                      default:
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-danger text-white">Erro</span>
                    }
                  })()}
                </div>
              </div>

              {showPrompt ? (
                <div className="flex space-x-2">
                  <button onClick={handleInstall} className="flex-1 bg-primary text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors">Instalar</button>
                  <button onClick={hidePrompt} className="flex-1 bg-surface text-text-secondary text-xs font-medium py-2 px-3 rounded-lg hover:bg-surface/80 transition-colors">Agora não</button>
                </div>
              ) : shouldShowFallback ? (
                <div className="text-xs text-text-secondary">
                  <p className="mb-2">
                    Para instalar no seu dispositivo, toque no menu do navegador {' '}
                    <span className="inline-flex items-center px-1 py-0.5 rounded bg-surface text-text font-mono">⋮</span>
                    {' '} e selecione:
                  </p>
                  <div className="mb-3 ml-2">
                    {isChrome && (
                      <p><strong>Chrome:</strong> "Instalar app" ou "Adicionar à tela inicial"</p>
                    )}
                    {isEdge && (
                      <p><strong>Edge:</strong> "Instalar aplicativo" ou "Aplicativos"</p>
                    )}
                    {isSamsung && (
                      <p><strong>Samsung Internet:</strong> "Adicionar página à" → "Tela inicial"</p>
                    )}
                    {!isChrome && !isEdge && !isSamsung && (
                      <ul className="space-y-1">
                        <li>• <strong>Chrome:</strong> "Instalar app"</li>
                        <li>• <strong>Edge:</strong> "Instalar aplicativo"</li>
                        <li>• <strong>Samsung:</strong> "Adicionar à tela inicial"</li>
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={hidePrompt} className="flex-1 bg-surface text-text-secondary text-xs font-medium py-2 px-3 rounded-lg hover:bg-surface/80 transition-colors">Entendi</button>
                  </div>
                </div>
              ) : null}
            </div>

            <button onClick={hidePrompt} className="flex-shrink-0 text-text-secondary hover:text-text" title="Fechar">
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt
