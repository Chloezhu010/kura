'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      style={{ background: '#0c0c0c', padding: '0 32px' }}
    >
      {/* Logo */}
      <p style={{
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontSize: '36px', fontWeight: 400, letterSpacing: '0.08em',
        color: '#FAFAF8', marginBottom: 8,
      }}>
        Kura
      </p>
      <p style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(196,168,130,0.5)', marginBottom: 56,
      }}>
        Your coffee collection
      </p>

      {sent ? (
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '22px', fontWeight: 300, fontStyle: 'italic',
            color: '#FAFAF8', marginBottom: 12, lineHeight: 1.4,
          }}>
            Check your inbox
          </p>
          <p style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '12px', color: 'rgba(250,250,248,0.4)',
            letterSpacing: '0.02em', lineHeight: 1.6,
          }}>
            We sent a magic link to <span style={{ color: '#C4A882' }}>{email}</span>.
            Click it to sign in — no password needed.
          </p>
          <button
            type="button"
            onClick={() => { setSent(false); setEmail('') }}
            style={{
              marginTop: 28,
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(196,168,130,0.5)', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320 }}>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(196,168,130,0.6)', marginBottom: 8,
          }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            style={{
              display: 'block', width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(196,168,130,0.2)',
              borderRadius: 4,
              padding: '12px 14px',
              color: '#FAFAF8',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '14px', letterSpacing: '0.02em',
              outline: 'none',
              marginBottom: 12,
            }}
          />

          {error && (
            <p style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '11px', color: 'rgba(192,64,64,0.8)',
              marginBottom: 10, letterSpacing: '0.02em',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              width: '100%', padding: '13px',
              background: email.trim() ? '#C4A882' : 'rgba(196,168,130,0.25)',
              border: 'none', borderRadius: 4,
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '18px', fontWeight: 400, letterSpacing: '0.04em',
              color: email.trim() ? '#0c0c0c' : 'rgba(196,168,130,0.5)',
              cursor: email.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {loading ? 'Sending…' : 'Continue with email'}
          </button>
        </form>
      )}
    </div>
  )
}
