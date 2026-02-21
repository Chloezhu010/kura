'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBeans } from '@/hooks/useBeans'
import { StarRating } from '@/components/ui/StarRating'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { Bean, RoastLevel } from '@/lib/repositories/types'

const SESSION_KEY = 'kura_pending_photo'

interface FormState {
  tastingNotes: string
  rating: number
  name: string
  origin: string
  roaster: string
  roastLevel: RoastLevel | undefined
  brewMethod: string
  price: string
}

interface FieldError {
  tastingNotes?: string
  rating?: string
}

export function AddFormScreen() {
  const router = useRouter()
  const { saveBean } = useBeans()
  const [photo, setPhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [form, setForm] = useState<FormState>({
    tastingNotes: '',
    rating: 0,
    name: '',
    origin: '',
    roaster: '',
    roastLevel: undefined,
    brewMethod: '',
    price: '',
  })

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (!stored) {
      // No photo — go back
      router.replace('/collection/add')
      return
    }
    setPhoto(stored)
  }, [router])

  function generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    // Fallback for HTTP (non-secure context) and older Safari
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  function validate(): boolean {
    const next: FieldError = {}
    if (!form.tastingNotes.trim()) next.tastingNotes = 'Tasting notes are required'
    if (form.rating === 0) next.rating = 'Please select a rating'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!photo || !validate()) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const bean: Bean = {
        id: generateId(),
        photo,
        tastingNotes: form.tastingNotes.trim(),
        rating: form.rating,
        name: form.name.trim() || undefined,
        origin: form.origin.trim() || undefined,
        roaster: form.roaster.trim() || undefined,
        roastLevel: form.roastLevel,
        brewMethod: form.brewMethod.trim() || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        createdAt: now,
        updatedAt: now,
      }
      await saveBean(bean)
      sessionStorage.removeItem(SESSION_KEY)
      router.push('/collection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex items-center px-6 py-5" style={{ flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => router.push('/collection/add')}
          aria-label="Back"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1
          className="flex-1 text-center"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '0.04em',
            marginRight: 20,
          }}
        >
          Bean Details
        </h1>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Photo thumbnail */}
        {photo && (
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Selected photo"
              style={{
                width: 72,
                height: 96,
                objectFit: 'cover',
                borderRadius: 1,
                display: 'block',
              }}
            />
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Tasting Notes — required */}
          <div>
            <label style={labelStyle}>Tasting Notes *</label>
            <textarea
              value={form.tastingNotes}
              onChange={(e) => {
                setForm((f) => ({ ...f, tastingNotes: e.target.value }))
                if (errors.tastingNotes) setErrors((er) => ({ ...er, tastingNotes: undefined }))
              }}
              placeholder="e.g. cherry, dark chocolate, bright acidity"
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 72,
              }}
            />
            {errors.tastingNotes && <p style={errorStyle}>{errors.tastingNotes}</p>}
          </div>

          {/* Rating — required */}
          <div>
            <label style={labelStyle}>Rating *</label>
            <StarRating
              value={form.rating}
              onChange={(r) => {
                setForm((f) => ({ ...f, rating: r }))
                if (errors.rating) setErrors((er) => ({ ...er, rating: undefined }))
              }}
            />
            {errors.rating && <p style={{ ...errorStyle, marginTop: 6 }}>{errors.rating}</p>}
          </div>

          {/* Bean Name */}
          <div>
            <label style={labelStyle}>Bean Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Yirgacheffe Natural"
              style={inputStyle}
            />
          </div>

          {/* Origin */}
          <div>
            <label style={labelStyle}>Origin</label>
            <input
              type="text"
              value={form.origin}
              onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
              placeholder="e.g. Ethiopia Yirgacheffe"
              style={inputStyle}
            />
          </div>

          {/* Roaster */}
          <div>
            <label style={labelStyle}>Roaster</label>
            <input
              type="text"
              value={form.roaster}
              onChange={(e) => setForm((f) => ({ ...f, roaster: e.target.value }))}
              placeholder="e.g. Square Mile"
              style={inputStyle}
            />
          </div>

          {/* Roast Level */}
          <div>
            <label style={labelStyle}>Roast Level</label>
            <SegmentedControl
              value={form.roastLevel}
              onChange={(v) => setForm((f) => ({ ...f, roastLevel: v }))}
            />
          </div>

          {/* Brew Method */}
          <div>
            <label style={labelStyle}>Brew Method</label>
            <input
              type="text"
              value={form.brewMethod}
              onChange={(e) => setForm((f) => ({ ...f, brewMethod: e.target.value }))}
              placeholder="e.g. V60, Espresso, AeroPress"
              style={inputStyle}
            />
          </div>

          {/* Price */}
          <div>
            <label style={labelStyle}>Price</label>
            <div style={{ position: 'relative' }}>
              <span style={{ ...inputStyle, position: 'absolute', top: 0, left: 0, pointerEvents: 'none', color: '#C4A882', lineHeight: '40px' }}>
                €
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: '18px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="px-6 pb-8 pt-4" style={{ flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '16px',
            background: saving ? '#C4A882aa' : '#C4A882',
            border: 'none',
            color: '#FAFAF8',
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '18px',
            fontWeight: 400,
            letterSpacing: '0.06em',
            cursor: saving ? 'wait' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Bean'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-inter), system-ui, sans-serif',
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#1A1A1A',
  opacity: 0.45,
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.15)',
  outline: 'none',
  fontFamily: 'var(--font-inter), system-ui, sans-serif',
  fontSize: '15px',
  color: '#1A1A1A',
  padding: '8px 0',
  display: 'block',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-inter), system-ui, sans-serif',
  fontSize: '11px',
  color: '#C0392B',
  marginTop: 4,
}
