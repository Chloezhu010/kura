'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { useBeans } from '@/hooks/useBeans'

const SESSION_KEY = 'kura_pending_photo'

export function AddPhotoScreen() {
  const router = useRouter()
  const { uploadPhoto } = useBeans()
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const isImage = file.type.startsWith('image/') || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)
    if (!isImage) return
    setCompressing(true)
    try {
      const photoUrl = await uploadPhoto(file)
      setPreview(photoUrl)
      sessionStorage.setItem(SESSION_KEY, photoUrl)
    } finally {
      setCompressing(false)
    }
  }, [uploadPhoto])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void handleFile(file)
    },
    [handleFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) void handleFile(file)
    },
    [handleFile]
  )

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: '#FAFAF8' }}
    >
      {/* Header */}
      <div className="flex items-center px-6 py-5" style={{ flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => router.push('/collection')}
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
            marginRight: 20, // balance the back button
          }}
        >
          Add Bean
        </h1>
      </div>

      {/* Upload area */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div
          onClick={() => !preview && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            width: '100%',
            maxWidth: 340,
            aspectRatio: '3 / 4',
            border: `1.5px dashed ${dragOver ? '#C4A882' : 'rgba(26,26,26,0.2)'}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: preview ? 'default' : 'pointer',
            background: dragOver ? 'rgba(196,168,130,0.04)' : 'transparent',
            transition: 'border-color 0.2s ease, background 0.2s ease',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Replace button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  background: 'rgba(26,26,26,0.6)',
                  border: 'none',
                  color: '#FAFAF8',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  backdropFilter: 'blur(4px)',
                }}
              >
                Replace
              </button>
            </>
          ) : compressing ? (
            <div className="flex flex-col items-center gap-3">
              <div style={{
                width: 32, height: 32, border: '2px solid #C4A882',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '12px', letterSpacing: '0.08em', color: '#C4A882',
              }}>Processing…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              {/* Camera icon */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C4A882"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '16px',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'rgba(26,26,26,0.5)',
                  lineHeight: 1.5,
                }}
              >
                Tap to upload your coffee bag photo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload photo"
      />

      {/* Continue button */}
      <div className="px-6 pb-8 pt-4" style={{ flexShrink: 0 }}>
        <button
          type="button"
          disabled={!preview || compressing}
          onClick={() => router.push('/collection/add/form')}
          style={{
            width: '100%',
            padding: '16px',
            background: preview ? '#C4A882' : 'rgba(196,168,130,0.3)',
            border: 'none',
            color: '#FAFAF8',
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '18px',
            fontWeight: 400,
            letterSpacing: '0.06em',
            cursor: preview ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
