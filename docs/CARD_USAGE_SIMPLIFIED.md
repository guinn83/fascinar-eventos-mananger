# Card Components Usage Guide - SIMPLIFICADO

## ✅ Implementação Final Simplificada

### 1. ✅ Gradiente aplicado em todos os cards
- Cards normais: `bg-surface + bg-gradient-card`
- Cards enfatizados (`tone="emphasized"`): `bg-surface-2 + bg-gradient-card`
- Ambos agora têm gradiente aplicado automaticamente

### 2. ✅ Surface-header separado no tema
- **Novo token:** `surface-header` no tema (light e dark)
- **Uso automático:** `CardHeader` usa `bg-surface-header` automaticamente
- **Controle separado:** Background do header independente dos outros surfaces

### 3. ✅ CardHeader simplificado
CardHeader agora usa automaticamente o `surface-header` - sem variants complexas:

```tsx
import { Card, CardHeader, CardTitle } from '../components/ui/card'

// Header com surface-header automático
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

## Personalização do surface-header

### No tema light:
```typescript
'surface-header': '#e2e8f0', // slate-200 - dedicated header background
```

### No tema dark:
```typescript
'surface-header': '#ce19aaff', // cor customizada para headers
```

### Tokens simplificados:
```typescript
header: {
  background: 'bg-surface-header bg-gradient-card', // Usa surface-header + gradiente
  border: 'border-b border-border',                 // Borda padrão
  padding: 'px-6 py-4'                              // Padding padrão
}
```

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

### Card com header (usa surface-header automaticamente)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

## Vantagens da simplificação

- ✅ **Menos redundância:** `CardTitle` existente funciona perfeitamente
- ✅ **API mais limpa:** Sem variants complexas desnecessárias  
- ✅ **Automático:** `CardHeader` usa `surface-header` automaticamente
- ✅ **Customizável:** Ainda pode alterar cores via tema

## Como personalizar
1. Edite `src/components/ui/theme.ts`
2. Altere `'surface-header'` nos temas light/dark
3. Salve - headers atualizam automaticamente

A implementação agora é muito mais simples e não compete com o `CardTitle` existente!
