'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Bean } from '@/lib/repositories/types'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const CARD_W = 260
const CARD_H = 340

// V1 Vinyl transform config
const SLOTS = [
  { t:  0, x:    0, ry:   0, s: 1,    o: 1,    z: 10 },
  { t:  1, x:  210, ry:  50, s: 0.73, o: 0.55, z: 7  },
  { t: -1, x: -210, ry: -50, s: 0.73, o: 0.55, z: 7  },
  { t:  2, x:  390, ry:  65, s: 0.5,  o: 0.28, z: 4  },
  { t: -2, x: -390, ry: -65, s: 0.5,  o: 0.28, z: 4  },
]

function cardStyle(offset: number): React.CSSProperties {
  const slot = SLOTS.find((s) => s.t === offset)
  if (!slot) return { display: 'none' }
  return {
    transform: `translate(-50%, -50%) translateX(${slot.x}px) rotateY(${slot.ry}deg) scale(${slot.s})`,
    opacity: slot.o,
    zIndex: slot.z,
  }
}

interface CoverflowProps {
  beans: Bean[]
  activeIndex: number
  onIndexChange: (idx: number) => void
  onCardClick: (bean: Bean) => void
  onDelete: (id: string) => void
}

export function Coverflow({ beans, activeIndex, onIndexChange, onCardClick, onDelete }: CoverflowProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)

  // Keep a stable ref to navigate so the wheel listener (attached once) stays current
  const navigateRef = useRef<(dir: number) => void>(() => {})
  useEffect(() => {
    navigateRef.current = (dir: number) => {
      onIndexChange(Math.max(0, Math.min(activeIndex + dir, beans.length - 1)))
    }
  }, [activeIndex, beans.length, onIndexChange])

  // Wheel / trackpad — must use addEventListener with passive:false to preventDefault
  const wheelAccum = useRef(0)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      wheelAccum.current += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(wheelAccum.current) > 55) {
        navigateRef.current(wheelAccum.current > 0 ? 1 : -1)
        wheelAccum.current = 0
      }
      wheelTimer.current = setTimeout(() => { wheelAccum.current = 0 }, 200)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, []) // attach once only

  // Mouse drag
  const dragX = useRef<number | null>(null)
  const didDrag = useRef(false)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragX.current = e.clientX
    didDrag.current = false
  }, [])
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragX.current === null) return
    const delta = dragX.current - e.clientX
    if (Math.abs(delta) > 55) {
      navigateRef.current(delta > 0 ? 1 : -1)
      dragX.current = null
      didDrag.current = true
    }
  }, [])
  const handleMouseUp = useCallback(() => { dragX.current = null }, [])

  // Touch
  const touchStartX = useRef(0)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    didDrag.current = false
  }, [])
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > 10) didDrag.current = true
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 48) navigateRef.current(delta > 0 ? 1 : -1)
  }, [])

  const handleCardClick = useCallback(
    (bean: Bean, offset: number) => {
      if (didDrag.current) return
      if (offset === 0) onCardClick(bean)
      else onIndexChange(beans.indexOf(bean))
    },
    [beans, onCardClick, onIndexChange]
  )

  return (
    <>
      <div
        ref={sceneRef}
        className="relative w-full flex-1 overflow-hidden"
        style={{
          background: '#0c0c0c',
          minHeight: 0,
          cursor: 'grab',
          perspective: '1100px',
          perspectiveOrigin: '50% 42%',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cards */}
        {beans.map((bean, i) => {
          const offset = i - activeIndex
          if (Math.abs(offset) > 2) return null
          const isCenter = offset === 0

          return (
            <div
              key={bean.id}
              className="coverflow-card absolute"
              style={{
                left: '50%',
                top: '42%',
                width: CARD_W,
                height: CARD_H,
                overflow: 'hidden',
                ...cardStyle(offset),
              }}
              onClick={() => handleCardClick(bean, offset)}
            >
              {/* Delete × — center card only */}
              {isCenter && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(bean.id) }}
                  aria-label="Remove bean"
                  style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 20,
                    background: 'rgba(12,12,12,0.6)', border: 'none',
                    color: '#FAFAF8', width: 26, height: 26, borderRadius: '50%',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '15px', lineHeight: 1,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  ×
                </button>
              )}

              {/* Card face */}
              <div style={{ width: CARD_W, height: CARD_H, borderRadius: 2, overflow: 'hidden', background: '#1c1c1c', position: 'relative' }}>
                {bean.photo
                  ? <img src={bean.photo} alt={bean.name ?? 'Coffee bean'} draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '44px' }}>☕</div>
                }
              </div>
            </div>
          )
        })}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message="Remove this bean?"
          onConfirm={() => {
            onDelete(deleteTarget)
            setDeleteTarget(null)
            onIndexChange(Math.max(0, activeIndex - 1))
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
