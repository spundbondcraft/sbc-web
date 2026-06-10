import { type ReactNode, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, { bg: string; color: string; border: string }> = {
  primary:   { bg: '#E8470A', color: '#fff',     border: 'transparent' },
  secondary: { bg: '#5A8A0A', color: '#fff',     border: 'transparent' },
  ghost:     { bg: 'transparent', color: '#374151', border: '#E5E7EB' },
  danger:    { bg: '#EF4444', color: '#fff',     border: 'transparent' },
  success:   { bg: '#7AB611', color: '#fff',     border: 'transparent' },
}

const SIZES: Record<ButtonSize, { padding: string; fontSize: string }> = {
  sm: { padding: '6px 12px',  fontSize: '12px' },
  md: { padding: '9px 18px',  fontSize: '13px' },
  lg: { padding: '12px 24px', fontSize: '15px' },
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const v = VARIANTS[variant]
  const s = SIZES[size]

  return (
    <button
      disabled={disabled || loading}
      className={`font-montserrat font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 ${className ?? ''}`}
      style={{
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        padding: s.padding,
        fontSize: s.fontSize,
      }}
      {...props}
    >
      {loading && (
        <span
          className="animate-spin w-4 h-4 border-2 rounded-full flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'currentColor' }}
        />
      )}
      {children}
    </button>
  )
}
