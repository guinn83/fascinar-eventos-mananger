/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cores dinâmicas via CSS variables
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
          title: 'var(--color-surface-title)',
          hover: 'var(--color-surface-hover)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        item: 'var(--color-item)',
        'item-hover': 'var(--color-item-hover)',
  // Icon semantic colors
  'icon-1': 'var(--color-icon-1)',
  'icon-2': 'var(--color-icon-2)',
  'icon-3': 'var(--color-icon-3)',
      },
      fontSize: {
        h1: ['var(--font-size-h1)', { lineHeight: 'var(--line-height-tight)' }],
        h2: ['var(--font-size-h2)', { lineHeight: 'var(--line-height-tight)' }],
        h3: ['var(--font-size-h3)', { lineHeight: 'var(--line-height-normal)' }],
        h4: ['var(--font-size-h4)', { lineHeight: 'var(--line-height-normal)' }],
      },
      spacing: {
        'theme-xs': 'var(--spacing-xs)',
        'theme-sm': 'var(--spacing-sm)',
        'theme-md': 'var(--spacing-md)',
        'theme-lg': 'var(--spacing-lg)',
        'theme-xl': 'var(--spacing-xl)',
        'theme-xxl': 'var(--spacing-xxl)',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'gradient-button': 'var(--gradient-button)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-page': 'var(--gradient-page)',
      },
    },
  },
  safelist: [
    'bg-item',
    'hover:bg-item-hover',
    'bg-gradient-button',
    'bg-surface-2',
    'bg-surface-title',
    'bg-gradient-card',
    'bg-surface-hover',
    'bg-primary-light',
    'bg-primary-hover',
    'bg-none'
  ],
  plugins: [],
}
