# Guia de Padronização Visual - Sistema Implementado

## ✅ O que foi implementado

### 1. Sistema de Design Tokens (`src/styles/theme.ts`)
- **Cores:** primary, background, surface, text (secondary, muted), status colors (success, warning, danger, info), border
- **Tipografia:** h1, h2, h3, h4, body, small, xs com font weights e line heights
- **Espaçamento:** xs, sm, md, lg, xl, xxl
- **Ícones:** xs, sm, md, lg, xl 
- **Sombras:** sm, md, lg
- **Border radius:** sm, md, lg, xl

### 2. ThemeProvider (`src/components/ThemeProvider.tsx`)
- Context React para gerenciar tema atual
- Auto-detecção de `prefers-color-scheme`
- Persistência no localStorage
- Aplicação automática de CSS variables
- Hooks: `useTheme()`, `useDarkMode()`

### 3. Componente ThemeToggle (`src/components/ThemeToggle.tsx`)
- Toggle button com ícones Moon/Sun
- Versão compacta para menus
- Integrado no Layout (sidebar)

### 4. Configuração Tailwind (`tailwind.config.js`)
- `darkMode: 'class'` habilitado
- Cores mapeadas para CSS variables
- Utilitários de typography (text-h1, text-h2, etc.)
- Espaçamentos com prefix `theme-*`

### 5. Refatoração Inicial (EventStaffView)
- Header com `text-h1`, `text-text-secondary`, `text-small`
- Resume card com `icon-xl`, `text-h3`, `text-primary`
- Lista com `icon-md`

## 🎯 Como usar nos próximos componentes

### Classes de Tipografia
```tsx
// Títulos principais
<h1 className="text-h1 text-text">Título Principal</h1>

// Subtítulos e seções
<h2 className="text-h2 text-text">Subtítulo</h2>
<h3 className="text-h3 text-text">Seção</h3>

// Texto secundário
<p className="text-small text-text-secondary">Informação adicional</p>
<p className="text-xs text-text-muted">Caption ou label</p>
```

### Cores Semânticas
```tsx
// Backgrounds
<div className="bg-background">Fundo principal</div>
<div className="bg-surface hover:bg-surface-hover">Card ou elemento</div>

// Texto
<span className="text-text">Texto principal</span>
<span className="text-text-secondary">Texto secundário</span>
<span className="text-text-muted">Texto esmaecido</span>

// Primary colors
<button className="bg-primary hover:bg-primary-hover text-white">Botão</button>
<span className="text-primary">Link ou destaque</span>

// Status colors
<span className="text-success">Sucesso</span>
<span className="text-warning">Aviso</span>
<span className="text-danger">Erro</span>
```

### Ícones
```tsx
import { User, Calendar, Settings } from 'lucide-react'

// Tamanhos padronizados
<User className="icon-sm" />   {/* 16px */}
<Calendar className="icon-md" /> {/* 20px */}
<Settings className="icon-lg" /> {/* 24px */}

// Com cores semânticas
<User className="icon-md text-primary" />
<Calendar className="icon-lg text-text-secondary" />
```

### Espaçamentos
```tsx
// Containers
<div className="space-y-theme-md">Seções</div>  {/* 16px */}
<div className="space-y-theme-lg">Cards</div>    {/* 24px */}

// Padding
<div className="p-theme-md">Conteúdo</div>      {/* 16px */}
<div className="px-theme-lg py-theme-sm">Botão</div>
```

## 🌓 Dark Mode

### Automático
- Detecta `prefers-color-scheme: dark`
- Salva preferência no localStorage
- Toggle disponível no sidebar

### Manual
```tsx
import { useTheme } from '../components/ThemeProvider'

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme()
  
  // Forçar tema específico
  const handleSetDark = () => setTheme('dark')
  
  // Toggle
  const handleToggle = () => toggleTheme()
  
  return (
    <div className={`p-4 ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
      {/* Conteúdo */}
    </div>
  )
}
```

## 📋 Checklist para novos componentes

**Antes de implementar:**
- [ ] Usar `text-h1`, `text-h2`, etc. para tipografia
- [ ] Usar `text-text`, `text-text-secondary`, `text-text-muted` para cores de texto
- [ ] Usar `bg-background`, `bg-surface` para backgrounds
- [ ] Usar `text-primary`, `bg-primary` para elementos destacados
- [ ] Usar `icon-sm`, `icon-md`, `icon-lg` para ícones
- [ ] Usar `text-success`, `text-danger`, etc. para status

**Validação:**
- [ ] Testar em tema claro e escuro
- [ ] Verificar contraste de cores
- [ ] Validar responsividade
- [ ] Build sem erros

## 🚀 Próximos passos

1. **Refatorar componentes existentes** seguindo o padrão do EventStaffView
2. **Criar componentes base** (Button, Input, Card) usando os tokens
3. **Validar acessibilidade** com ferramentas como axe
4. **Documentar padrões** específicos (formulários, listas, modais)

## 💡 Dicas

- **CSS Variables:** Todas as cores e tamanhos estão disponíveis como `var(--color-primary)`, `var(--font-size-h1)`, etc.
- **Tailwind:** Prefira as classes semânticas (`text-h1`) sobre valores hardcoded (`text-3xl`)
- **Consistência:** Sempre use os tokens definidos, evite cores/tamanhos custom
- **Dark Mode:** Teste sempre ambos os temas ao desenvolver

O sistema está pronto para ser usado e expandido! 🎉
