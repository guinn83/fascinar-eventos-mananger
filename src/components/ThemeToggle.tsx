import React from 'react'
import { useTheme } from './ThemeProvider'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center
        rounded-lg border border-border transition-all duration-200
        bg-surface hover:bg-surface-hover
        text-text-secondary hover:text-text
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${className}
      `}
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      <div className="relative">
        {theme === 'light' ? (
          <Moon className="h-5 w-5 transition-transform duration-200" />
        ) : (
          <Sun className="h-5 w-5 transition-transform duration-200" />
        )}
      </div>
    </button>
  )
}

// Versão mais compacta para usar em menus
export const ThemeToggleCompact: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm
        rounded-md transition-colors duration-200
        text-text-secondary hover:text-text hover:bg-surface-hover
        ${className}
      `}
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          Tema Escuro
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          Tema Claro
        </>
      )}
    </button>
  )
}
