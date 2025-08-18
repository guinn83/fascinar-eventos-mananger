# Como Usar o PWA Debug

## ❌ NÃO FUNCIONA no Terminal PowerShell
```bash
# ERRO: Não execute JavaScript no PowerShell
fetch('/pwa-debug.js').then(r => r.text()).then(eval)
```

## ✅ CORRETO: Use no Console do Navegador

### 1. Abra o Navegador
- Acesse: http://localhost:5174/
- Pressione **F12** para abrir DevTools
- Vá para a aba **Console**

### 2. Cole e Execute o Script
```javascript
// Cole ISSO no console do navegador:
fetch('/pwa-debug.js').then(r => r.text()).then(eval)
```

### 3. Use os Comandos Disponíveis
```javascript
// Verificar critérios PWA
checkPWAInstallCriteria()

// Verificar Service Worker
checkServiceWorker()

// Verificar Manifest
checkManifest()

// Simular engajamento do usuário
simulateUserEngagement()

// Limpar dados PWA
clearPWAData()

// Forçar prompt de instalação
forceInstallPrompt()

// Ver todos os comandos
showPWACommands()
```

## 🚀 Teste Rápido Manual

### Verificar PWA Status (Console do Navegador):
```javascript
// Status básico
console.log('PWA Status:', {
  isInstalled: window.matchMedia('(display-mode: standalone)').matches,
  hasServiceWorker: 'serviceWorker' in navigator,
  hasManifest: !!document.querySelector('link[rel="manifest"]'),
  isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
  userEngaged: localStorage.getItem('user-engaged'),
  timeSpent: localStorage.getItem('engagement-time-met')
})
```

### Testar Prompt de Instalação:
```javascript
// Simular condições para mostrar prompt
localStorage.setItem('user-engaged', 'true')
localStorage.setItem('engagement-time-met', 'true')
localStorage.removeItem('pwa-install-dismissed')

// Recarregar página para ver prompt
location.reload()
```

## 📱 Teste no Android/Edge

### 1. Acesse via IP da rede
- URL: http://192.168.100.6:5174/
- Ou use ngrok/localtunnel para HTTPS

### 2. No Edge Android:
1. Clique em qualquer lugar (user engagement)
2. Aguarde 30 segundos
3. Veja se aparece prompt ou instruções
4. Menu (⋮) → "Aplicativos" → "Instalar este site"

## 🔧 Debug Simplificado

Se não quiser usar o script completo, use estes comandos simples no console:

```javascript
// Ver se PWA pode ser instalado
console.log('Can install:', !window.matchMedia('(display-mode: standalone)').matches)

// Ver engagement status
console.log('User engaged:', localStorage.getItem('user-engaged'))
console.log('Time requirement:', localStorage.getItem('engagement-time-met'))

// Simular engagement
localStorage.setItem('user-engaged', 'true')
localStorage.setItem('engagement-time-met', 'true')
```
