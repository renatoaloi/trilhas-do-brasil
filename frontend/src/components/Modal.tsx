import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title?: string
  children: ReactNode
  onClose?: () => void
  actions?: ReactNode
}

export default function Modal({ open, title, children, onClose, actions }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-dark-graphite border border-stone/30 rounded-xl shadow-2xl">
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-stone/20">
            <h2 className="text-lg font-display font-bold text-white">{title}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-stone hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-3 p-4 border-t border-stone/20">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
