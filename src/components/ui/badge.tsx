import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function Badge({ 
  children, 
  className = '', 
  variant = 'default'
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
  secondary: 'bg-surface text-text-secondary',
    destructive: 'bg-danger/10 text-danger',
    outline: 'border border-border text-text-secondary'
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
