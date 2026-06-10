'use client'
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: '400px',
  md: '520px',
  lg: '680px',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ maxWidth: SIZES[size], background: '#fff' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <h2 className="font-montserrat font-bold text-base" style={{ color: '#1A1A1A' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: '#9CA3AF' }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
