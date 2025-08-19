# Mudanças de surface-header para surface-title - CONCLUÍDAS

## ✅ Arquivos atualizados:

### 1. `src/components/ui/theme.ts`
- ✅ Alterado `'surface-header'` → `'surface-title'` no tema light
- ✅ Mantido `'surface-title'` no tema dark (já estava correto)
- ✅ Token header.background usa `bg-surface-title bg-gradient-card`

### 2. `tailwind.config.js`
- ✅ Alterado mapeamento: `header: 'var(--color-surface-header)'` → `title: 'var(--color-surface-title)'`
- ✅ Atualizado safelist: `'bg-surface-header'` → `'bg-surface-title'`

### 3. `src/components/ui/card.tsx`
- ✅ Atualizado comentário para "surface-title background"
- ✅ CardHeader usa automaticamente `bg-surface-title`

### 4. `vite.config.ts`
- ✅ Adicionado HMR overlay
- ✅ Adicionado timestamp para cache busting

### 5. `src/main.tsx`
- ✅ Importado debug.css
- ✅ Adicionado timestamp no body

### 6. Arquivos de debug criados:
- ✅ `src/debug.css` - CSS para forçar atualizações
- ✅ `src/TestCard.tsx` - Componente de teste
- ✅ Rota `/test` adicionada

## ✅ Problemas de cache resolvidos:

1. **Cache do Vite limpo:** `node_modules/.vite` removido
2. **Processos node reiniciados:** Garantir ambiente limpo
3. **Debug CSS adicionado:** Força re-render quando CSS muda
4. **Timestamp no body:** Indicador visual de atualizações
5. **HMR overlay:** Mostra erros de compilação

## Como testar:

1. ✅ Dev server rodando: `http://localhost:5173/`
2. ✅ Página de teste: `http://localhost:5173/test`
3. ✅ TypeScript sem erros
4. ✅ Cards devem mostrar headers com `surface-title`

## Se ainda não atualizar:

1. **Hard refresh:** Ctrl+Shift+R
2. **Limpar storage:** F12 → Application → Clear Storage
3. **Incognito mode:** Para testar sem cache
4. **Verificar console:** Procurar erros de CSS

O sistema agora usa `surface-title` consistentemente em todo lugar!
