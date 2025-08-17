import React from 'react'
import { cardTokens } from './theme'

type Size = 'sm' | 'md' | 'lg'

interface CardProps {
  children: React.ReactNode
  className?: string
  size?: Size
  padding?: string // override spacing token
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  size?: Size
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
  size?: Size
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '', size = 'md', padding }: CardProps) {
  // By default Card doesn't add inner padding so consumers can opt-in with
  // CardHeader/CardContent. If `padding` is provided, we wrap children.
  const shouldWrap = Boolean(padding)
  const spacing = padding ?? cardTokens.spacing[size]

  return (
  <div className={`${cardTokens.background} ${cardTokens.radius} ${cardTokens.shadow} ${cardTokens.border} ${className}`}>
      {shouldWrap ? (
        <div className={`w-full ${spacing}`}>
          {children}
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}

export function CardHeader({ children, className = '', size = 'md' }: CardHeaderProps) {
  const spacing = cardTokens.spacing[size]
  return (
    <div className={`border-b border-border/60 ${spacing} ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '', size = 'md' }: CardContentProps) {
  const spacing = cardTokens.spacing[size]
  return (
    <div className={`${spacing} ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`${cardTokens.title} ${className}`}>
      {children}
    </h3>
  )
}
