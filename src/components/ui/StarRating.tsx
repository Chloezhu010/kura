'use client'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ value, onChange, readonly = false, size = 28 }: StarRatingProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-btn"
          onClick={() => !readonly && onChange?.(star)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          disabled={readonly}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= value ? '#C4A882' : 'none'}
            stroke={star <= value ? '#C4A882' : '#C4A882'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}
