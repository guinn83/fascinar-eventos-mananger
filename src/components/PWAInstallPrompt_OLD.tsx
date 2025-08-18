import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'

// Error Boundary para PWA
const PWAInstallPrompt: React.FC = () => {
  const [swStatus, setSwStatus] = useState<'none' | 'registered' | 'controlling' | 'error'>('none')
  const [error, setError] = useState<string | null>(null)

  // Verificações de segurança para navegadores
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined'
  
  if (!isBrowser) return null

  // Se houve erro, não renderizar
  if (error) {
    console.warn('[PWA] Component disabled due to error:', error)
    return null
  }

  try {
    // Import hooks dinâmico para evitar quebrar se houver erro
    const { usePWADetection, usePWAInstall } = require('../hooks/usePWA')
    const { useUserEngagement } = require('../hooks/useUserEngagement')

    // Hooks PWA - com fallback para SSR
    const pwaDetection = usePWADetection()
    const pwaInstall = usePWAInstall()
    const userEngagement = useUserEngagement()

    const {
      isPWA = false
    } = pwaDetection || {}

    const {
      showInstallPrompt = false,
      installPWA = async () => false,
      hideInstallPrompt = () => {},
      isPromptDismissed = false
    } = pwaInstall || {}

    const {
      canShowInstallPrompt = true
    } = userEngagement || {}

    // Detecção mais robusta de navegadores
    const userAgent = navigator?.userAgent || ''
    const isAndroid = /Android/.test(userAgent)
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent)
    const isEdge = /Edg/.test(userAgent)
    const isSamsung = /SamsungBrowser/.test(userAgent)
    
    // Só mostrar fallback para navegadores que suportam PWA mas não têm beforeinstallprompt
    const isChromiumAndroid = isAndroid && (isChrome || isEdge || isSamsung)

    // Show prompt if app is not installed *and* either we have a beforeinstallprompt available
    // (showInstallPrompt) or we are in a Chromium Android browser where the native prompt may be in the browser UI.
    // Also check user engagement criteria
    if (isPWA || isPromptDismissed || !canShowInstallPrompt) return null
    
    // Para Android Chromium, só mostrar se não temos o prompt nativo disponível
    const shouldShowFallback = isChromiumAndroid && !showInstallPrompt
    const shouldShow = showInstallPrompt || shouldShowFallback
    
    if (!shouldShow) return null
  const shouldShow = showInstallPrompt || shouldShowFallback
  
  if (!shouldShow) return null

  // Runtime check: track Service Worker installation/activation status for debugging and UI
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported in this browser')
      setSwStatus('error')
      return
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setSwStatus(navigator.serviceWorker.controller ? 'controlling' : 'registered')
        console.log('[PWA] Service Worker registration found:', reg)
      } else {
        setSwStatus('none')
        console.warn('[PWA] No Service Worker registration found')
      }
    }).catch((err) => {
      setSwStatus('error')
      console.error('[PWA] Error while checking Service Worker registration', err)
    })
  }, [])

  const handleInstall = async () => {
    const installed = await installPWA()
    if (installed) {
      // App instalado com sucesso
    }
  }

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
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-success text-white" aria-label="Service Worker ativo">Ativo</span>
                      case 'registered':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-warning text-white" aria-label="Service Worker registrado">Registrado</span>
                      case 'none':
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-surface text-text" aria-label="Service Worker não registrado">Não registrado</span>
                      case 'error':
                      default:
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-danger text-white" aria-label="Erro ao verificar Service Worker">Erro</span>
                    }
                  })()}
                </div>
              </div>

              {showInstallPrompt ? (
                <div className="flex space-x-2">
                  <button onClick={handleInstall} className="flex-1 bg-primary text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors">Instalar</button>
                  <button onClick={hideInstallPrompt} className="flex-1 bg-surface text-text-secondary text-xs font-medium py-2 px-3 rounded-lg hover:bg-surface/80 transition-colors">Agora não</button>
                </div>
              ) : shouldShowFallback ? (
                // Fallback para navegadores Android (Edge/Chrome): instruir instalação via menu do navegador
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
                    <button onClick={hideInstallPrompt} className="flex-1 bg-surface text-text-secondary text-xs font-medium py-2 px-3 rounded-lg hover:bg-surface/80 transition-colors">Entendi</button>
                  </div>
                </div>
              ) : null}
            </div>

            <button onClick={hideInstallPrompt} className="flex-shrink-0 text-text-secondary hover:text-text" title="Fechar" aria-label="Fechar prompt de instalação">
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt
