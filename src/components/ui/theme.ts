// Centralized design system with light/dark themes and UI tokens

// Design tokens para tema claro e escuro
export const light = {
  colors: {
    // Cores da marca: #C3A0BD | #F1E3E9 | #FDF6F9 | #D39937 | #E5B652
    // Primary colors
    primary: '#4f2f6dff',          // blue-800
    'primary-hover': '#2d1a3fff',  // blue-700
    'primary-light': '#fcce00ff',  // updated to match brand accent (was #671eacff)
    
    // Background colors
    background: '#ffffff',
    surface: '#f8fafc',          // slate-50
    'surface-2': '#f1f5f9',      // slate-100 - slightly more prominent surface
    'surface-title': '#e2e8f0', // slate-200 - dedicated title background (UPDATED)
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
  
  // Icon color tokens - three semantic options for icons (separate from primary)
  // Use these in icon elements: `text-icon-1`, `text-icon-2`, `text-icon-3`
  'icon-1': '#6b7280',   // slate-500 - muted / secondary icon color
  'icon-2': '#4f2f6d',   // brand tone (compatible with primary but editable)
  'icon-3': '#d39937',   // accent / highlight (gold)
  },

  // Gradients (used by components that opt-in)
  gradients: {
    // Card background gradient (fallback to surface color if not supported)
    card: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
    button: 'linear-gradient(180deg, #ffffff1a 0%, #0000001a 100%)'
  ,
  // Page / global background gradient option
  page: 'linear-gradient(180deg, rgba(245,247,250,0.6), rgba(255,255,255,0))'
  },
  
  fontSizes: {
    h1: '2.25rem',    // 36px - titles principais
    h2: '1.875rem',   // 30px - subtítulos importantes
    h3: '1.5rem',     // 24px - section headers
    h4: '1.125rem',   // 18px - card titles (reduced)
    body: '1rem',     // 16px - texto padrão
    small: '0.875rem', // 14px - texto secundário
    xs: '0.75rem',    // 12px - captions, labels

  // Button sizes (tokens for easy global control)
  button: '0.875rem',   // 14px - default button font size
  'button-sm': '0.8125rem', // 13px
  'button-lg': '1rem',   // 16px
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
  // keep vertical compact but give more horizontal room for headers on small size
    sm: 'px-4 py-2 md:px-6 md:py-3',
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },
  
  iconSizes: {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '20px',
  xl: '28px',
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
    // Cores da marca: #261323 | #66345A | #C3A0BD | #D39937 | #E5B652
    // Primary colors - mais claros no dark mode
    primary: '#770b5eff',          // blue-800
    'primary-hover': '#5a0045ff',  // blue-700
    'primary-light': '#c58700ff',  // blue-500
    
    // Background colors - tons escuros
    background: '#261323',       // slate-300
    surface: '#2e192bff',          // slate-500
    'surface-2': '#3a1435ff', 
    'surface-title': '#2e192bff', // slightly lighter / more prominent surface for emphasized cards
    'surface-hover': '#663462ff',  // slate-700
    
    // Item backgrounds for card contents (dark theme)
    item: '#1d101bff',             // slightly lighter than surface
    'item-hover': '#492b44ff',       // lighter on hover

    // Text colors - tons claros
    text: '#ffffffff',            // slate-50
    'text-secondary': '#aaa1a7ff', // slate-300
    'text-muted': '#dad2d9ff',    // slate-400
    'icon-1': '#94a3b8', // slate-400 - muted icon color for dark
    'icon-2': '#922480ff', // brand tone for dark
    'icon-3': '#fcce00ff', // accent/gold for dark

    // Status colors - ajustados para dark mode
    success: '#fcce00ff',         // emerald-500
    warning: '#ff7b00ff',         // amber-500
    danger:  '#7c062aff',          // red-500
    info: '#ddb0d7ff',           // sky-500
    
  // Border colors
  border: '#412a47ff',         // gray-700
  'border-strong': '#66345A', // gray-600
  },

  gradients: {
    // Stronger, tinted gradients for dark theme
  card: 'linear-gradient(180deg, #ffffff05, #00000028)',
  button: 'linear-gradient(180deg, #ffffff0d 0%, #00000060 100%)',
  page: 'linear-gradient(180deg, #1a0a1266, #26111c)'
  },
  
  // Reutilizar do tema claro
  fontSizes: { ...light.fontSizes },
  fontWeights: { ...light.fontWeights },
  lineHeights: { ...light.lineHeights },
  spacing: { ...light.spacing },
  iconSizes: { ...light.iconSizes },
  borderRadius: { ...light.borderRadius },
  
  // Sombras mais sutis no dark modes
  shadows: {
  // Dark mode needs stronger, more visible shadows for depth
  sm: '0 2px 6px 0 rgb(0 0 0 / 0.5)',
  md: '0 4px 12px -2px rgb(0 0 0 / 0.5)',
  lg: '0 8px 24px -4px rgb(0 0 0 / 0.5)',
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
  'icon-md': 'w-4 h-4',
  'icon-lg': 'w-5 h-5',
  'icon-xl': 'w-7 h-7',
  'icon-2xl': 'w-10 h-10',

  // Common spacing
  'space-section': 'space-y-6',
  'space-card': 'space-y-4',
  'space-form': 'space-y-3',
}

// Tokens específicos para componentes UI (mantidos da versão anterior)
export const cardTokens = {
  // container - agora usando variáveis CSS dinâmicas
  // Keep surface color as fallback and provide an opt-in gradient utility
  background: 'bg-surface bg-gradient-card',
  border: 'border border-border',
  radius: 'rounded-2xl',
  shadow: 'shadow-md',
  // Use theme-aware shadows (these map to CSS variables via tailwind.config)
  shadowTheme: 'shadow-theme-md',
  shadowStrong: 'shadow-theme-lg',

  // spacing variants — used by CardHeader/CardContent
  spacing: {
    // responsive spacing: smaller screens use compact padding, larger screens get more room
  // small card spacing: keep vertical compact but increase horizontal padding
  sm: 'px-4 py-2 md:px-6 md:py-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  },

  // title
  title: 'text-h4 text-text',

  // header customization tokens
  header: {
    background: 'bg-surface-title',
    border: 'border-b border-border',
  // compact header padding with increased horizontal gutter on small screens
  padding: 'px-4 py-2 md:px-6 md:py-3',
  // ensure the header's top corners match the card radius and clip children
  radius: 'rounded-t-2xl overflow-hidden'
  },

  // Cores editáveis para diferentes níveis dentro do card
  colors: {
  // `card` is the default surface; `cardEmphasized` is a stronger background
  card: 'bg-surface',
  cardEmphasized: 'bg-surface-2',
    item: 'bg-item',
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
    sm: 'px-2 py-2',
    md: 'px-4 py-4',
    lg: 'px-8 py-8'
  },
  // Standard header horizontal padding (responsive)
  headerPadding: 'px-3 md:px-3 lg:px-12',
  // vertical gap between stacked cards on a page
  cardGap: {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  }
}

export default { cardTokens, uiTokens, pageTokens, themes, light, dark }
