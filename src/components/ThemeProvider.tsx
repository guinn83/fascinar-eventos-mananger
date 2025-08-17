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

    // Aplicar variáveis CSS para typography
    Object.entries(themeData.fontSizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value)
    })

    // Aplicar variáveis CSS para spacing
    Object.entries(themeData.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })

    // Aplicar variáveis CSS para shadows
    Object.entries(themeData.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })

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
