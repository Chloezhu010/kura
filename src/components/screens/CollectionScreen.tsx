'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBeans } from '@/hooks/useBeans'
import { Coverflow } from '@/components/coverflow/Coverflow'
import type { Bean } from '@/lib/repositories/types'

function matchesQuery(bean: Bean, q: string): boolean {
  const lower = q.toLowerCase()
  return [
    bean.name,
    bean.origin,
    bean.roaster,
    bean.tastingNotes,
    bean.brewMethod,
    bean.roastLevel,
  ].some((field) => field?.toLowerCase().includes(lower))
}

export function CollectionScreen() {
  const router = useRouter()
  const { beans, loading, deleteBean } = useBeans()
  const [activeIndex, setActiveIndex] = useState(0)
  const [query, setQuery] = useState('')

  const filteredBeans = query.trim()
    ? beans.filter((b) => matchesQuery(b, query.trim()))
    : beans

  // Reset active card when search changes
  useEffect(() => { setActiveIndex(0) }, [query])

  const safeIndex = Math.min(activeIndex, Math.max(0, filteredBeans.length - 1))
  const activeBean = filteredBeans[safeIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0c0c0c' }}>
        <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '18px', color: '#C4A882', fontStyle: 'italic' }}>
          Loading…
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0c0c0c' }}>

      {/* Top bar */}
      <div className="flex items-baseline justify-between" style={{ padding: '22px 24px 10px', flexShrink: 0 }}>
        <span style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: '24px', fontWeight: 400, letterSpacing: '0.06em', color: '#FAFAF8',
        }}>
          Kura
        </span>
        <span style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(196,168,130,0.45)',
        }}>
          {query.trim()
            ? `${filteredBeans.length} of ${beans.length}`
            : `${beans.length} ${beans.length === 1 ? 'bean' : 'beans'}`}
        </span>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 24px 12px', flexShrink: 0 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(196,168,130,0.5)" strokeWidth="1.5" strokeLinecap="round"
            style={{ position: 'absolute', left: 10, pointerEvents: 'none', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search beans…"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(196,168,130,0.15)',
              borderRadius: 6,
              padding: '8px 32px 8px 30px',
              color: '#FAFAF8',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '13px',
              letterSpacing: '0.02em',
              outline: 'none',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{
                position: 'absolute', right: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(196,168,130,0.5)', fontSize: '16px', lineHeight: 1,
                padding: 2,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Coverflow or empty state */}
      {beans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <p style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '22px', fontStyle: 'italic', fontWeight: 300,
            color: 'rgba(250,250,248,0.5)', letterSpacing: '0.01em',
          }}>
            Your collection is empty.
          </p>
          <button
            type="button"
            onClick={() => router.push('/collection/add')}
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#C4A882', background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            + Add your first bean
          </button>
        </div>
      ) : filteredBeans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '20px', fontStyle: 'italic', fontWeight: 300,
            color: 'rgba(250,250,248,0.4)', letterSpacing: '0.01em',
          }}>
            No beans match &ldquo;{query}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#C4A882', background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <Coverflow
          beans={filteredBeans}
          activeIndex={safeIndex}
          onIndexChange={setActiveIndex}
          onCardClick={(bean) => router.push(`/beans/${bean.id}`)}
          onDelete={deleteBean}
        />
      )}

      {/* Bottom section */}
      <div style={{ flexShrink: 0, padding: '4px 24px 28px' }}>
        {/* Active bean name + origin */}
        {activeBean && (
          <div style={{ textAlign: 'center', marginBottom: 14, minHeight: 40 }}>
            <p style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '18px', fontWeight: 400, color: '#FAFAF8',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {activeBean.name ?? 'Unnamed Bean'}
            </p>
            {activeBean.origin && (
              <p style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(196,168,130,0.6)', marginTop: 3,
              }}>
                {activeBean.origin}
              </p>
            )}
          </div>
        )}

        {/* Controls row: dots left, + right */}
        <div className="flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex items-center" style={{ gap: 6 }}>
            {filteredBeans.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to bean ${i + 1}`}
                style={{
                  border: 'none', padding: 0, cursor: 'pointer',
                  height: 4, borderRadius: 2,
                  width: i === safeIndex ? 20 : 5,
                  background: i === safeIndex ? '#C4A882' : 'rgba(196,168,130,0.22)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={() => router.push('/collection/add')}
            aria-label="Add bean"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#C4A882', border: 'none',
              color: '#0c0c0c', fontSize: '24px', lineHeight: 1,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

    </div>
  )
}
