import React from 'react'
import { usePWADetection, usePWAInstall } from '../hooks/usePWA'

const PWAInstallPrompt: React.FC = () => {
  const { isPWA, canInstall } = usePWADetection()
  const { showInstallPrompt, installPWA, hideInstallPrompt } = usePWAInstall()

  if (isPWA || !canInstall || !showInstallPrompt) {
    return null
  }

  const handleInstall = async () => {
    const installed = await installPWA()
    if (installed) {
      // App instalado com sucesso
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-blue-200 rounded-2xl p-4 shadow-lg z-50 max-w-sm mx-auto">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <i className="fas fa-download text-blue-600"></i>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Instalar App
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Instale o Fascinar Eventos para acesso mais rápido e notificações.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={hideInstallPrompt}
              className="flex-1 bg-gray-100 text-gray-700 text-xs font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        
        <button
          onClick={hideInstallPrompt}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          title="Fechar"
          aria-label="Fechar prompt de instalação"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
