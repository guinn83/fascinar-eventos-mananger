// PWA Debug Helper
// Cole este código no console do navegador para debugar PWA

console.log('🔍 PWA Debug Helper - Fascinar Eventos');

// Função para limpar completamente o Service Worker
const clearServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🧹 Limpando Service Worker...');
      
      // Desregistrar todos os service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        console.log('Desregistrando SW:', registration.scope);
        await registration.unregister();
      }
      
      // Limpar todos os caches
      const cacheNames = await caches.keys();
      for (let cacheName of cacheNames) {
        console.log('Deletando cache:', cacheName);
        await caches.delete(cacheName);
      }
      
      console.log('✅ Service Worker e caches limpos!');
      console.log('🔄 Recarregue a página para aplicar as mudanças');
      
    } catch (error) {
      console.error('❌ Erro ao limpar SW:', error);
    }
  }
};

// Verificar critérios de instalação
const checkPWAInstallCriteria = () => {
  const criteria = {
    https: location.protocol === 'https:' || location.hostname === 'localhost',
    manifest: !!document.querySelector('link[rel="manifest"]'),
    serviceWorker: 'serviceWorker' in navigator,
    userEngaged: localStorage.getItem('user-engaged') === 'true',
    timeSpent: localStorage.getItem('engagement-time-met') === 'true',
    notInstalled: !window.matchMedia('(display-mode: standalone)').matches,
    beforeInstallPrompt: !!window.deferredPrompt
  };

  console.log('📋 PWA Install Criteria:', criteria);
  
  const allMet = Object.values(criteria).every(Boolean);
  console.log(allMet ? '✅ All criteria met!' : '❌ Some criteria missing');
  
  return criteria;
};

// Verificar status do Service Worker
const checkServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      console.log('🔧 Service Worker Status:', {
        registered: !!registration,
        controlling: !!navigator.serviceWorker.controller,
        scope: registration?.scope,
        state: registration?.active?.state
      });
    } catch (error) {
      console.error('❌ Service Worker Error:', error);
    }
  } else {
    console.log('❌ Service Worker not supported');
  }
};

// Verificar manifest
const checkManifest = async () => {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    try {
      const response = await fetch(manifestLink.href);
      const manifest = await response.json();
      console.log('📱 Manifest:', manifest);
      
      const requiredFields = ['name', 'start_url', 'display', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ Manifest has all required fields');
      } else {
        console.log('❌ Missing manifest fields:', missingFields);
      }
    } catch (error) {
      console.error('❌ Manifest Error:', error);
    }
  } else {
    console.log('❌ Manifest not found');
  }
};

// Simular user engagement (para teste)
const simulateUserEngagement = () => {
  localStorage.setItem('user-engaged', 'true');
  localStorage.setItem('engagement-time-met', 'true');
  localStorage.setItem('session-start', (Date.now() - 60000).toString()); // 1 minuto atrás
  console.log('✅ User engagement simulated');
};

// Limpar persistência PWA
const clearPWAData = () => {
  const keys = [
    'pwa-install-dismissed',
    'user-engaged', 
    'engagement-time-met',
    'session-start',
    'last-interaction'
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
  console.log('🧹 PWA data cleared');
};

// Forçar prompt de instalação (se disponível)
const forceInstallPrompt = () => {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    console.log('📲 Install prompt triggered');
  } else {
    console.log('❌ No deferred prompt available');
  }
};

// Menu de comandos
const showPWACommands = () => {
  console.log(`
🎛️  PWA Debug Commands:
  
checkPWAInstallCriteria() - Verificar critérios de instalação
checkServiceWorker()      - Status do Service Worker  
checkManifest()           - Verificar manifest.json
simulateUserEngagement()  - Simular engajamento do usuário
clearPWAData()            - Limpar dados PWA salvos
clearServiceWorker()      - LIMPAR SERVICE WORKER (resolver problemas de rede)
forceInstallPrompt()      - Forçar prompt de instalação
showPWACommands()         - Mostrar estes comandos novamente
  `);
};

// Executar verificações iniciais
checkPWAInstallCriteria();
checkServiceWorker();
checkManifest();
showPWACommands();

// Tornar funções globais para uso no console
window.checkPWAInstallCriteria = checkPWAInstallCriteria;
window.checkServiceWorker = checkServiceWorker;
window.checkManifest = checkManifest;
window.simulateUserEngagement = simulateUserEngagement;
window.clearPWAData = clearPWAData;
window.clearServiceWorker = clearServiceWorker;
window.forceInstallPrompt = forceInstallPrompt;
window.showPWACommands = showPWACommands;
