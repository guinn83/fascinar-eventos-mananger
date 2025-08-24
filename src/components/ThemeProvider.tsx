import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { themes, type ThemeName, type Theme } from './ui/theme'

interface ThemeContextValue {
  theme: ThemeName
  themeData: Theme
  toggleTheme: () => void
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    // Tentar carregar do localStorage primeiro
    const savedTheme = localStorage.getItem('theme') as ThemeName | null
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme
    }
    
    // Fallback para preferência do sistema
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light'
  })

  const applyTheme = (theme: ThemeName) => {
    const themeData = themes[theme]
    const root = document.documentElement

    // Aplicar variáveis CSS para cores
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Compute and set "hover" color tokens for any base color that lacks a hover token.
    // This avoids relying on CSS color-mix and ensures older browsers receive a sensible hover.
    const hasHoverToken = (k: string) => Object.prototype.hasOwnProperty.call((themeData as any).colors, `${k}-hover`)

    const hexToRgb = (hex: string) => {
      // Accept #RRGGBB or #RRGGBBAA
      if (!hex) return null
      const cleaned = hex.replace('#', '')
      const hasAlpha = cleaned.length === 8
      const r = parseInt(cleaned.substring(0, 2), 16)
      const g = parseInt(cleaned.substring(2, 4), 16)
      const b = parseInt(cleaned.substring(4, 6), 16)
      const a = hasAlpha ? parseInt(cleaned.substring(6, 8), 16) / 255 : 1
      return { r, g, b, a }
    }

    const rgbToHex = (r: number, g: number, b: number, a?: number) => {
      const toHex = (n: number) => {
        const v = Math.max(0, Math.min(255, Math.round(n)))
        return v.toString(16).padStart(2, '0')
      }
      if (typeof a === 'number') {
        const aa = Math.max(0, Math.min(1, a))
        return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(aa * 255))}`
      }
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    const darken = (hex: string, amount = 0.18) => {
      const rgb = hexToRgb(hex)
      if (!rgb) return hex
      const r = Math.round(rgb.r * (1 - amount))
      const g = Math.round(rgb.g * (1 - amount))
      const b = Math.round(rgb.b * (1 - amount))
      return rgbToHex(r, g, b, rgb.a)
    }

    // For each base color token, if <token>-hover does not exist, compute a darker variant and set it.
    Object.keys((themeData as any).colors).forEach((key) => {
      // only compute for base tokens (no '-' in key or keys not already hover tokens)
      if (key.endsWith('-hover')) return
      const hoverKey = `${key}-hover`
      if (!hasHoverToken(key)) {
        const base = (themeData as any).colors[key]
  const computed = darken(base, 0.18)
  if (computed) root.style.setProperty(`--color-${hoverKey}`, computed)
      }
    })

    // Runtime debug: verify important surface variable is applied to :root
    try {
      const applied = getComputedStyle(root).getPropertyValue('--color-surface-2')
      // Trim to make logs cleaner
      const appliedTrim = applied ? applied.trim() : applied
      console.debug('[ThemeProvider] applied --color-surface-2 =', appliedTrim, 'for theme', theme)
      if (!appliedTrim) {
        console.warn('[ThemeProvider] --color-surface-2 not set or empty after applying theme', theme)
      }
    } catch (e) {
      // Defensive: don't break app if getComputedStyle throws (very unlikely)
      console.error('[ThemeProvider] error reading computed style for --color-surface-2', e)
    }

    // Backwards-compat: ensure icon tokens exist even if theme missing them
    if (!(themeData as any).colors['icon-1']) {
      // Prefer explicit icon tokens if present, otherwise fallback to sensible colors
      root.style.setProperty('--color-icon-1', (themeData as any).colors['icon-1'] || (themeData as any).colors['text'] || '#6b7280')
      root.style.setProperty('--color-icon-2', (themeData as any).colors['icon-2'] || (themeData as any).colors['primary'] || '#4f2f6d')
      root.style.setProperty('--color-icon-3', (themeData as any).colors['icon-3'] || (themeData as any).colors['primary'] || '#d39937')
    }

    // Aplicar variáveis CSS para typography
    Object.entries(themeData.fontSizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value)
    })

    // Aplicar variáveis CSS para spacing
    Object.entries(themeData.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })

  // ...icon sizes were previously applied here but have been reverted

    // Aplicar variáveis CSS para shadows
    Object.entries(themeData.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })

    // Aplicar variáveis CSS para gradients (opcionais)
    if ((themeData as any).gradients) {
      Object.entries((themeData as any).gradients).forEach(([key, value]) => {
        root.style.setProperty(`--gradient-${key}`, value as string)
      })
    }

    // Sincronizar classe dark para Tailwind
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Salvar no localStorage
    localStorage.setItem('theme', theme)
  }

  useEffect(() => {
    applyTheme(themeName)
  }, [themeName])

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Só aplicar preferência do sistema se não houver tema salvo
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        setThemeName(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setThemeName(current => current === 'light' ? 'dark' : 'light')
  }

  const setTheme = (theme: ThemeName) => {
    setThemeName(theme)
  }

  const value: ThemeContextValue = {
    theme: themeName,
    themeData: themes[themeName],
    toggleTheme,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Hook para verificar se está no dark mode
export const useDarkMode = (): boolean => {
  const { theme } = useTheme()
  return theme === 'dark'
}
