'use client'

import type { RoastLevel } from '@/lib/repositories/types'

const OPTIONS: RoastLevel[] = ['Light', 'Medium', 'Dark']

interface SegmentedControlProps {
  value?: RoastLevel
  onChange?: (value: RoastLevel) => void
  readonly?: boolean
}

export function SegmentedControl({ value, onChange, readonly = false }: SegmentedControlProps) {
  return (
    <div
      className="flex rounded-sm overflow-hidden border border-[#C4A882] w-fit"
      role="group"
      aria-label="Roast level"
    >
      {OPTIONS.map((option, i) => {
        const active = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => !readonly && onChange?.(option)}
            disabled={readonly}
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '5px 12px',
              background: active ? '#C4A882' : 'transparent',
              color: active ? '#FAFAF8' : '#C4A882',
              border: 'none',
              borderLeft: i > 0 ? '1px solid #C4A882' : 'none',
              cursor: readonly ? 'default' : 'pointer',
              transition: 'background 0.2s ease, color 0.2s ease',
              lineHeight: 1,
            }}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
