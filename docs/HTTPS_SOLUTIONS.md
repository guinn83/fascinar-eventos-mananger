# Soluções para HTTPS no Desenvolvimento

## ❌ Problema Resolvido
O comando `npm run dev:https` falhava porque `cross-env` não estava instalado.

## ✅ Soluções Disponíveis

### 1. **Desenvolvimento Local (HTTP) - RECOMENDADO**
```bash
npm run dev
# Acesse: http://localhost:5174/
# PWA funciona normalmente para testes básicos
```

### 2. **Rede Local (Para teste em dispositivos)**
```bash
npm run dev:network  
# Acesse: http://192.168.100.6:5174/
# Teste no Android/Edge via rede local
```

### 3. **HTTPS Local (Manual)**
Para ativar HTTPS local:

1. **Edite `vite.config.ts`**:
```typescript
server: {
  host: true,
  port: 5173,
  //https: true  // ← Descomente esta linha
}
```

2. **Execute**:
```bash
npm run dev
# Acesse: https://localhost:5173/
# ⚠️ Aceite o certificado self-signed
```

### 4. **Tunneling (Para HTTPS real)**

#### ngrok (Recomendado)
```bash
# Instale ngrok: https://ngrok.com/download
ngrok http 5174

# Use a URL HTTPS gerada
# Exemplo: https://abc123.ngrok.io
```

#### localtunnel
```bash
# Instale globalmente
npm install -g localtunnel

# Execute
npx localtunnel --port 5174 --subdomain fascinar-eventos
# URL: https://fascinar-eventos.loca.lt
```

## 🧪 **Teste PWA Sem HTTPS**

### Para desenvolvimento local:
1. **PWA funciona** em `localhost` mesmo com HTTP
2. **beforeinstallprompt** funciona normalmente
3. **Service Worker** registra corretamente

### Para teste Android:
1. **Use rede local**: `http://192.168.100.6:5174/`
2. **Funcionalidades limitadas** sem HTTPS
3. **Para teste completo**: use ngrok ou localtunnel

## 🎯 **Comandos Atualizados**

```bash
# Desenvolvimento local
npm run dev

# Rede local (para dispositivos)
npm run dev:network

# Debug PWA
# Acesse: http://localhost:5174/pwa-debug.html
```

## ⚠️ **Observações**

- **HTTP funciona** para desenvolvimento local
- **HTTPS necessário** apenas para:
  - Teste em dispositivos remotos
  - Funcionalidades avançadas PWA
  - Produção

- **PWA básico funciona** sem HTTPS em localhost
- **Para Edge Android**: use tunneling se precisar de HTTPS
