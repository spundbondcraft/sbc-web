import { type ReactNode } from 'react'

type BadgeVariant = 'orange' | 'green' | 'blue' | 'yellow' | 'purple' | 'gray' | 'red'

const VARIANTS: Record<BadgeVariant, { bg: string; text: string }> = {
  orange: { bg: '#FED7AA', text: '#C2410C' },
  green:  { bg: '#D1FAE5', text: '#065F46' },
  blue:   { bg: '#DBEAFE', text: '#1E40AF' },
  yellow: { bg: '#FEF3C7', text: '#92400E' },
  purple: { bg: '#EDE9FE', text: '#5B21B6' },
  gray:   { bg: '#F3F4F6', text: '#374151' },
  red:    { bg: '#FEE2E2', text: '#991B1B' },
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  const { bg, text } = VARIANTS[variant]
  return (
    <span
      className={`font-inter text-xs px-2.5 py-1 rounded-full inline-flex items-center ${className ?? ''}`}
      style={{ background: bg, color: text }}
    >
      {children}
    </span>
  )
}
