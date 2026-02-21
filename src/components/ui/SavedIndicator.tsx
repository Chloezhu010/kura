'use client'

import { useEffect, useState } from 'react'

interface SavedIndicatorProps {
  trigger: number // increment to trigger a flash
}

export function SavedIndicator({ trigger }: SavedIndicatorProps) {
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (trigger === 0) return
    setKey((k) => k + 1)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(t)
  }, [trigger])

  if (!visible) return null

  return (
    <span
      key={key}
      className="saved-flash"
      style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#C4A882',
        pointerEvents: 'none',
      }}
    >
      Saved
    </span>
  )
}
