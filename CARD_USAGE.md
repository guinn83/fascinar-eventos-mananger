# Card Components Usage Guide

## ✅ Implementações realizadas

### 1. ✅ Gradiente aplicado em todos os cards
- Cards normais: `bg-surface + bg-gradient-card`
- Cards enfatizados (`tone="emphasized"`): `bg-surface-2 + bg-gradient-card`
- Ambos agora têm gradiente aplicado automaticamente

### 2. ✅ Surface-header separado no tema
- **Novo token:** `surface-header` no tema (light e dark)
- **Controle separado:** Background do header independente dos outros surfaces
- **Classes geradas:** `bg-surface-header` disponível no Tailwind

### 3. ✅ CardHeader customizável
Novo CardHeader com suporte a variantes e cores do tema:

```tsx
import { Card, CardHeader, CardHeaderTitle } from '../components/ui/card'

// Header padrão (usa surface-header)
<CardHeader>
  <CardHeaderTitle>Título do Card</CardHeaderTitle>
</CardHeader>

// Header enfatizado (usa surface-2)
<CardHeader variant="emphasized">
  <CardHeaderTitle>Título Importante</CardHeaderTitle>
</CardHeader>

// Header sem borda
<CardHeader noBorder>
  <CardHeaderTitle variant="secondary">Título Secundário</CardHeaderTitle>
</CardHeader>
```

### 4. ✅ Tokens de tema para header
Novos tokens adicionados em `cardTokens.header`:

- `background`: `bg-surface-header bg-gradient-card` (usa o novo surface-header)
- `backgroundEmphasized`: `bg-surface-2 bg-gradient-card`
- `text`: Cor de texto principal
- `textSecondary`: Cor de texto secundária
- `border`: Classes de borda
- `padding`: Padding padrão

## Personalização do surface-header

### No tema light:
```typescript
'surface-header': '#e2e8f0', // slate-200 - dedicated header background
```

### No tema dark:
```typescript
'surface-header': '#ce19aaff', // cor customizada para headers
```

### Como alterar:
1. Edite `src/components/ui/theme.ts`
2. Altere a cor em `light.colors['surface-header']` e `dark.colors['surface-header']`
3. Salve o arquivo - a atualização deve ser imediata

## Como usar

### Card básico com gradiente
```tsx
<Card>
  <CardContent>
    Conteúdo do card com gradiente
  </CardContent>
</Card>
```

### Card enfatizado com gradiente
```tsx
<Card tone="emphasized">
  <CardContent>
    Card enfatizado (surface-2) + gradiente
  </CardContent>
</Card>
```

### Card com header customizado
```tsx
<Card>
  <CardHeader variant="emphasized">
    <CardHeaderTitle>Título do Card</CardHeaderTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

## Resolução de problemas

### Se o app parou de atualizar:
1. ✅ Dev server foi reiniciado
2. ✅ HMR deveria estar funcionando agora
3. Se ainda houver problemas, force reload (Ctrl+F5)

### Teste agora
Salve um arquivo para triggerar rebuild e:
- Todos os cards devem mostrar gradientes
- Headers devem usar a cor `surface-header` configurada no tema!
