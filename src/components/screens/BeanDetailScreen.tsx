'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeans } from '@/hooks/useBeans'
import { compressImage } from '@/lib/compressImage'
import { StarRating } from '@/components/ui/StarRating'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SavedIndicator } from '@/components/ui/SavedIndicator'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Bean, RoastLevel } from '@/lib/repositories/types'

interface BeanDetailScreenProps {
  id: string
}

export function BeanDetailScreen({ id }: BeanDetailScreenProps) {
  const router = useRouter()
  const { getBeanById, saveBean, deleteBean } = useBeans()
  const [bean, setBean] = useState<Bean | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedTick, setSavedTick] = useState(0)
  const [showDelete, setShowDelete] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getBeanById(id).then((b) => { setBean(b); setLoading(false) })
  }, [id, getBeanById])

  const flash = useCallback(() => setSavedTick((t) => t + 1), [])

  // Always-current ref so the debounced save never reads stale closure state
  const beanRef = useRef<Bean | null>(null)
  useEffect(() => { beanRef.current = bean }, [bean])

  // Accumulates patches from rapid interactions (e.g. blur + star tap)
  const pendingPatch = useRef<Partial<Bean>>({})
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = useCallback(
    (patch: Partial<Bean>) => {
      // Apply immediately to UI — eliminates stale reads on next call
      setBean((prev) => (prev ? { ...prev, ...patch } : prev))

      // Merge into the pending batch
      pendingPatch.current = { ...pendingPatch.current, ...patch }

      // Debounce: one network request per burst of changes
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        const latest = beanRef.current
        if (!latest) return
        const toSave = { ...latest, ...pendingPatch.current }
        pendingPatch.current = {}
        const saved = await saveBean(toSave)
        setBean(saved)
        flash()
      }, 600)
    },
    [saveBean, flash]
  )

  const handlePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const base64 = await compressImage(file)
      update({ photo: base64 })
    },
    [update]
  )

  async function handleDelete() {
    await deleteBean(id)
    router.push('/collection')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0c0c0c' }}>
        <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '18px', color: '#C4A882', fontStyle: 'italic' }}>
          Loading…
        </p>
      </div>
    )
  }

  if (!bean) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: '#0c0c0c' }}>
        <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '18px', color: '#FAFAF8' }}>
          Bean not found.
        </p>
        <button onClick={() => router.push('/collection')} style={linkBtnStyle}>
          ← Back to collection
        </button>
      </div>
    )
  }

  const addedDate = new Date(bean.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ background: '#0c0c0c' }}>

      {/* ── Left: image panel — full height on desktop, fixed height on mobile ── */}
      <div className="relative flex-shrink-0 h-56 md:h-auto md:w-[42%]"
        style={{ overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => photoInputRef.current?.click()}
      >
        {/* Photo or placeholder gradient */}
        {bean.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bean.photo}
            alt={bean.name ?? 'Coffee bean'}
            draggable={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1c1410 0%, #3a2010 60%, #5a3020 100%)' }} />
        )}

        {/* Right-edge fade into dark bg — desktop only */}
        <div className="hidden md:block" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 65%, #0c0c0c 100%)',
          pointerEvents: 'none',
        }} />

        {/* "Change photo" hint on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
          padding: '0 0 20px 20px',
        }}>
          <span style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(196,168,130,0.55)',
          }}>
            Tap to change
          </span>
        </div>

        {/* Back button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); router.push('/collection') }}
          aria-label="Back"
          style={{
            position: 'absolute', top: 20, left: 20, zIndex: 10,
            background: 'rgba(12,12,12,0.55)', border: 'none',
            color: '#FAFAF8', width: 34, height: 34, borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Kura Collection badge */}
        <div style={{
          position: 'absolute', bottom: 24, left: 20, zIndex: 10,
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(196,168,130,0.5)',
        }}>
          Kura Collection
        </div>

        <input ref={photoInputRef} type="file" accept="image/*,.heic,.heif" className="sr-only"
          onChange={(e) => { e.stopPropagation(); void handlePhotoChange(e) }} />
      </div>

      {/* ── Right: scrollable details ── */}
      <div className="flex-1 overflow-y-auto" style={{
        padding: 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 48px) 72px clamp(20px, 4vw, 44px)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(196,168,130,0.2) transparent',
      }}>

        {/* Saved indicator — top right of panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <SavedIndicator trigger={savedTick} />
        </div>

        {/* Bean name */}
        <input
          type="text"
          defaultValue={bean.name ?? ''}
          placeholder="Bean Name"
          onBlur={(e) => update({ name: e.target.value.trim() || undefined })}
          className="inline-edit"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '42px', fontWeight: 400, lineHeight: 1.1,
            letterSpacing: '-0.01em', color: '#FAFAF8',
            display: 'block', width: '100%', marginBottom: 8,
          }}
        />

        {/* Origin */}
        <input
          type="text"
          defaultValue={bean.origin ?? ''}
          placeholder="Origin"
          onBlur={(e) => update({ origin: e.target.value.trim() || undefined })}
          className="inline-edit"
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#C4A882', display: 'block', width: '100%', marginBottom: 6,
          }}
        />

        {/* Roaster */}
        <input
          type="text"
          defaultValue={bean.roaster ?? ''}
          placeholder="Roaster"
          onBlur={(e) => update({ roaster: e.target.value.trim() || undefined })}
          className="inline-edit"
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '11px', letterSpacing: '0.06em',
            color: 'rgba(250,250,248,0.4)', display: 'block', width: '100%', marginBottom: 28,
          }}
        />

        {/* Stars */}
        <div style={{ marginBottom: 32 }}>
          <StarRating value={bean.rating} onChange={(r) => update({ rating: r })} size={20} />
        </div>

        {/* Tasting Notes */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, marginBottom: 24 }}>
          <p style={sectionLabelStyle}>Tasting Notes</p>
          <textarea
            defaultValue={bean.tastingNotes}
            onBlur={(e) => update({ tastingNotes: e.target.value })}
            rows={3}
            className="inline-edit"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '20px', fontWeight: 300, fontStyle: 'italic',
              lineHeight: 1.6, color: 'rgba(250,250,248,0.8)',
              display: 'block', width: '100%', marginTop: 12,
              resize: 'vertical',
            }}
          />
        </div>

        {/* Roast level */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, marginBottom: 24 }}>
          <p style={sectionLabelStyle}>Roast Level</p>
          <div style={{ marginTop: 12 }}>
            <SegmentedControl
              value={bean.roastLevel}
              onChange={(v: RoastLevel) => update({ roastLevel: v })}
            />
          </div>
        </div>

        {/* Details grid */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, marginBottom: 24 }}>
          <p style={sectionLabelStyle}>Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>

            <div>
              <p style={metaKeyStyle}>Brew Method</p>
              <input
                type="text"
                defaultValue={bean.brewMethod ?? ''}
                placeholder="—"
                onBlur={(e) => update({ brewMethod: e.target.value.trim() || undefined })}
                className="inline-edit"
                style={metaValStyle}
              />
            </div>

            <div>
              <p style={metaKeyStyle}>Price</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ ...metaValStyle, color: '#C4A882' }}>€</span>
                <input
                  type="number"
                  min="0" step="0.01"
                  defaultValue={bean.price ?? ''}
                  placeholder="—"
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value)
                    update({ price: isNaN(val) ? undefined : val })
                  }}
                  className="inline-edit"
                  style={{ ...metaValStyle, width: 80 }}
                />
              </div>
            </div>

            <div>
              <p style={metaKeyStyle}>Added</p>
              <p style={{ ...metaValStyle, fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '18px' }}>{addedDate}</p>
            </div>

          </div>
        </div>

        {/* Delete */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            style={{
              background: 'transparent', border: '1px solid rgba(180,60,60,0.2)',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(192,64,64,0.5)',
              padding: '7px 16px', borderRadius: 2,
              cursor: 'pointer',
            }}
          >
            Remove Bean
          </button>
        </div>

      </div>

      {showDelete && (
        <ConfirmDialog
          message="Delete this bean? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-inter), system-ui, sans-serif',
  fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
  color: 'rgba(250,250,248,0.38)',
}

const metaKeyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-inter), system-ui, sans-serif',
  fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase',
  color: 'rgba(250,250,248,0.38)', marginBottom: 4,
}

const metaValStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: '18px', fontWeight: 400, color: '#FAFAF8',
}

const linkBtnStyle: React.CSSProperties = {
  background: 'transparent', border: 'none',
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: '16px', color: '#C4A882', cursor: 'pointer',
}
