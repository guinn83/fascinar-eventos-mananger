import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'confirm' | 'edit' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantClasses: Record<string,string> = {
    default: 'bg-gradient-button text-white hover:bg-primary/90 focus:ring-primary/40',
    outline: 'border border-border bg-surface text-text hover:bg-surface-hover focus:ring-primary/40',
    ghost: 'text-text hover:bg-surface-hover focus:ring-primary/40',
    destructive: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger/40',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger/40',
    confirm: 'bg-success text-white hover:bg-success/80 focus:ring-primary/40',
    edit: 'bg-surface text-text hover:bg-surface-hover border border-border focus:ring-primary/40'
  }
  
  const sizeClasses = {
    default: 'h-10 py-2 px-3 text-sm',
    sm: 'h-8 px-2 text-xs',
    lg: 'h-12 px-4 text-base',
    icon: 'h-10 w-10 p-2.5'
  }
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
