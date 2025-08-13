# Configuração do Servidor com LocalTunnel

Este documento explica como configurar e executar o servidor de desenvolvimento com acesso externo usando LocalTunnel.

## Pré-requisitos

- Node.js instalado
- NPM ou Yarn
- Projeto React com Vite configurado

## Configuração do Vite

Para permitir acesso externo através do LocalTunnel, é necessário configurar o arquivo `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: true,
    allowedHosts: ['fascinar-eventos.loca.lt', '.loca.lt']
  }
})
```

### Explicação das configurações:

- `host: true` - Permite que o servidor aceite conexões de qualquer host
- `allowedHosts` - Lista de hosts permitidos para acesso externo
- `'fascinar-eventos.loca.lt'` - Subdomínio específico do LocalTunnel
- `'.loca.lt'` - Permite qualquer subdomínio do LocalTunnel

## Como executar o servidor

### 1. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Ou se estiver usando Yarn:

```bash
yarn dev
```

O servidor será iniciado em `http://localhost:5173/`

### 2. Criar o túnel LocalTunnel

Em um novo terminal, execute:

```bash
npx localtunnel --port 5173 --subdomain fascinar-eventos
```

### Parâmetros do LocalTunnel:

- `--port 5173` - Porta onde o servidor Vite está rodando
- `--subdomain fascinar-eventos` - Subdomínio personalizado (opcional)

## URLs de acesso

Após executar os comandos acima, você terá acesso através de:

- **Local**: `http://localhost:5173/`
- **Rede local**: `http://192.168.x.x:5173/` (IP da sua máquina)
- **Acesso externo**: `https://fascinar-eventos.loca.lt/`

## Solução de problemas

### Erro: "This host is not allowed"

Se você receber o erro sobre host não permitido, verifique se:

1. O arquivo `vite.config.ts` está configurado corretamente
2. O servidor foi reiniciado após a mudança na configuração
3. O host está listado em `allowedHosts`

### Túnel não funciona

Se o túnel LocalTunnel não estiver funcionando:

1. Verifique se o servidor local está rodando (`http://localhost:5173/`)
2. Reinicie o processo do LocalTunnel
3. Tente sem especificar o subdomínio:
   ```bash
   npx localtunnel --port 5173
   ```

### Subdomínio não disponível

Se o subdomínio desejado não estiver disponível, o LocalTunnel gerará um aleatório. Exemplo:
```
your url is: https://proud-bats-make.loca.lt
```

## Comandos úteis

### Verificar se o servidor está rodando
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5173 -Method Get

# CMD/Bash (se curl estiver disponível)
curl http://localhost:5173
```

### Verificar processos Node.js rodando
```bash
# PowerShell
Get-Process -Name node

# CMD
tasklist | findstr node
```

### Parar todos os processos Node.js
```bash
# PowerShell
Stop-Process -Name node -Force

# CMD
taskkill /F /IM node.exe
```

## Notas importantes

- ⚠️ **Segurança**: O LocalTunnel expõe seu servidor local para a internet. Use apenas para desenvolvimento e testes.
- 🔄 **Temporário**: URLs do LocalTunnel são temporárias e podem mudar a cada execução.
- 🌐 **Firewall**: Certifique-se de que seu firewall permite conexões na porta 5173.
- 📱 **Teste móvel**: Use a URL do LocalTunnel para testar sua aplicação em dispositivos móveis.

## Scripts NPM recomendados

Adicione estes scripts ao seu `package.json` para facilitar o uso:

```json
{
  "scripts": {
    "dev": "vite",
    "tunnel": "npx localtunnel --port 5173 --subdomain fascinar-eventos",
    "dev:tunnel": "concurrently \"npm run dev\" \"npm run tunnel\""
  }
}
```

Para usar o script combinado, instale o `concurrently`:

```bash
npm install --save-dev concurrently
```

Então execute:

```bash
npm run dev:tunnel
```

Isso iniciará o servidor e o túnel simultaneamente.
