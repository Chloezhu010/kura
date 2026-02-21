'use client'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,26,26,0.6)' }}
      onClick={onCancel}
    >
      <div
        className="bg-[#FAFAF8] px-8 py-7 rounded-sm max-w-xs w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: 'none' }}
      >
        <p
          className="text-center mb-6"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '18px',
            fontWeight: 400,
            color: '#1A1A1A',
            lineHeight: 1.4,
          }}
        >
          {message}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onCancel}
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              background: 'transparent',
              border: '1px solid #1A1A1A',
              padding: '8px 20px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#FAFAF8',
              background: '#C0392B',
              border: '1px solid #C0392B',
              padding: '8px 20px',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
