// Centralized design system with light/dark themes and UI tokens

// Design tokens para tema claro e escuro
export const light = {
  colors: {
    // Primary colors
    primary: '#4f2f6dff',          // blue-800
    'primary-hover': '#2d1a3fff',  // blue-700
    'primary-light': '#671eacff',  // blue-500
    
    // Background colors
    background: '#ffffff',
    surface: '#f8fafc',          // slate-50
    'surface-hover': '#f1f5f9',  // slate-100
    
    // Item backgrounds for card contents
    item: '#f1f5f9',             // slate-100 - slightly darker than surface
    'item-hover': '#e2e8f0',     // slate-200 - darker on hover
    
    // Text colors
    text: '#0f172a',            // slate-900
    'text-secondary': '#475569', // slate-600
    'text-muted': '#64748b',    // slate-500
    
    // Status colors
    success: '#059669',         // emerald-600
    warning: '#d97706',         // amber-600
    danger: '#962340ff',          // red-600
    info: '#0284c7',           // sky-600
    
    // Border colors
    border: '#e2e8f0',         // slate-200
    'border-strong': '#cbd5e1', // slate-300
  },
  
  fontSizes: {
    h1: '2.25rem',    // 36px - titles principais
    h2: '1.875rem',   // 30px - subtítulos importantes
    h3: '1.5rem',     // 24px - section headers
    h4: '1.25rem',    // 20px - card titles
    body: '1rem',     // 16px - texto padrão
    small: '0.875rem', // 14px - texto secundário
    xs: '0.75rem',    // 12px - captions, labels
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },
  
  iconSizes: {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },
  
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  }
}

export const dark = {
  colors: {
    // Primary colors - mais claros no dark mode
    primary: '#4f2f6dff',          // blue-800
    'primary-hover': '#2d1a3fff',  // blue-700
    'primary-light': '#671eacff',  // blue-500
    
    // Background colors - tons escuros
    background: '#110b0fff',       // slate-300
    surface: '#1f111dff',          // slate-500
    'surface-hover': '#66345A',  // slate-700
    
    // Item backgrounds for card contents (dark theme)
    item: '#301e2cff',             // slightly lighter than surface
    'item-hover': '#66345A',       // lighter on hover

    // Text colors - tons claros
    text: '#f8fafc',            // slate-50
    'text-secondary': '#cbd5e1', // slate-300
    'text-muted': '#94a3b8',    // slate-400
    
    // Status colors - ajustados para dark mode
    success: '#10b981',         // emerald-500
    warning: '#f59e0b',         // amber-500
    danger: '#a01d3dff',          // red-500
    info: '#0ea5e9',           // sky-500
    
    // Border colors
    border: '#301e2cff',         // gray-700
    'border-strong': '#66345A', // gray-600
  },
  
  // Reutilizar do tema claro
  fontSizes: { ...light.fontSizes },
  fontWeights: { ...light.fontWeights },
  lineHeights: { ...light.lineHeights },
  spacing: { ...light.spacing },
  iconSizes: { ...light.iconSizes },
  borderRadius: { ...light.borderRadius },
  
  // Sombras mais sutis no dark mode
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
  }
}

export type ThemeName = 'light' | 'dark'
export type Theme = typeof light

export const themes = { light, dark }

// Utilitários para componentes
export const getTheme = (themeName: ThemeName): Theme => themes[themeName]

// Mapeamentos para classes Tailwind comuns
export const semanticClasses = {
  // Typography
  'text-h1': 'text-4xl font-bold leading-tight',
  'text-h2': 'text-3xl font-semibold leading-tight', 
  'text-h3': 'text-2xl font-semibold leading-snug',
  'text-h4': 'text-xl font-medium leading-snug',
  'text-body': 'text-base leading-normal',
  'text-small': 'text-sm leading-normal',
  'text-xs': 'text-xs leading-tight',
  
  // Icon sizes
  'icon-xs': 'w-3 h-3',
  'icon-sm': 'w-4 h-4', 
  'icon-md': 'w-5 h-5',
  'icon-lg': 'w-6 h-6',
  'icon-xl': 'w-8 h-8',
  
  // Common spacing
  'space-section': 'space-y-6',
  'space-card': 'space-y-4',
  'space-form': 'space-y-3',
}

// Tokens específicos para componentes UI (mantidos da versão anterior)
export const cardTokens = {
  // container - agora usando variáveis CSS dinâmicas
  background: 'bg-surface',
  border: 'border border-border',
  radius: 'rounded-2xl',
  shadow: 'shadow-md',

  // spacing variants — used by CardHeader/CardContent
  spacing: {
    // responsive spacing: smaller screens use compact padding, larger screens get more room
    sm: 'p-2 md:p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  },

  // title
  title: 'text-h4 text-text',

  // Cores editáveis para diferentes níveis dentro do card
  colors: {
    // Cor de fundo do card principal (já definida como background acima)
    card: 'bg-surface',
    // Cor de fundo dos itens dentro do card (diferente do fundo principal)
    item: 'bg-item',
    // Cor quando o mouse passa por cima dos itens (apenas a cor, sem prefixo)
    itemHover: 'item-hover'
  }
}

// Função utilitária para aplicar classes de item
export const getCardItemClasses = (extraClasses: string = '') => {
  // Keep the item token dynamic but use a literal hover class so Tailwind's scanner
  // picks up the `hover:bg-item-hover` class during build/JIT.
  // Also include a small fallback class `.card-item-hover` which uses the CSS
  // variable `--color-item-hover` so hover will work immediately in the
  // browser even if Tailwind needs a rebuild to pick up dynamic classes.
  return `${cardTokens.colors.item} hover:bg-item-hover card-item-hover ${extraClasses}`
}

export const uiTokens = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary/40',
}

// Page-level spacing tokens for Layout and views to consume.
export const pageTokens = {
  // options: sm | md | lg — maps to Tailwind padding utilities
  container: {
    sm: 'px-4 py-4',
    md: 'px-4 py-4',
    lg: 'px-8 py-8'
  },
  // vertical gap between stacked cards on a page
  cardGap: {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  }
}

export default { cardTokens, uiTokens, pageTokens, themes, light, dark }
