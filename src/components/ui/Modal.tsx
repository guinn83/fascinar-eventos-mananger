import { useEffect } from 'react'

type ModalProps = {
  children: React.ReactNode
  open: boolean
  onClose?: () => void
  className?: string
  backdropClassName?: string
}

export function Modal({ children, open, onClose, className = '', backdropClassName = '' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 flex items-center justify-center z-50 ${backdropClassName || 'bg-black bg-opacity-70'}`}
      onClick={(e) => {
        // Close when clicking on backdrop
        if (e.target === e.currentTarget && onClose) onClose()
      }}
    >
      <div className={`relative w-full max-w-md mx-auto px-4 ${className}`}>
        {children}
      </div>
    </div>
  )
}
