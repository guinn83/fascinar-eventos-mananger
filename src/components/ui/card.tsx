import React from 'react'
import { cardTokens } from './theme'

type Size = 'sm' | 'md' | 'lg'

interface CardProps {
  children: React.ReactNode
  className?: string
  size?: Size
  padding?: string // override spacing token
  strong?: boolean
  tone?: 'normal' | 'emphasized'
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

export function Card({ children, className = '', size = 'md', padding, strong = false, tone = 'normal' }: CardProps) {
  // By default Card doesn't add inner padding so consumers can opt-in with
  // CardHeader/CardContent. If `padding` is provided, we wrap children.
  const shouldWrap = Boolean(padding)
  const spacing = padding ?? cardTokens.spacing[size]

  const shadowClass = strong ? cardTokens.shadowStrong : cardTokens.shadowTheme

  // Always use gradient background, but change base color based on tone
  const baseColorClass = tone === 'emphasized' ? 'bg-surface-2' : 'bg-surface'
  const gradientClass = 'bg-gradient-card'
  const backgroundClass = `${baseColorClass} ${gradientClass}`

  return (
  <div className={`${backgroundClass} ${cardTokens.radius} ${shadowClass} ${cardTokens.border} ${className}`}>
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
  
  // Use surface-title background with gradient and border
  return (
    <div className={`${cardTokens.header.background} ${cardTokens.header.border} ${spacing} ${className}`}>
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
