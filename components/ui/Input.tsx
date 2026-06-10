import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block font-inter text-xs font-semibold mb-1.5 uppercase tracking-wide"
            style={{ color: '#6B7280' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none transition-colors ${className ?? ''}`}
          style={{
            background: '#F9FAF6',
            border: `1px solid ${error ? '#EF4444' : '#E5E7EB'}`,
            color: '#1A1A1A',
          }}
          onFocus={e => { e.target.style.borderColor = '#E8470A' }}
          onBlur={e => { e.target.style.borderColor = error ? '#EF4444' : '#E5E7EB' }}
          {...props}
        />
        {error && (
          <p className="font-inter text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="font-inter text-xs mt-1" style={{ color: '#9CA3AF' }}>{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
