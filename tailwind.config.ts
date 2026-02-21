import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kura: {
          bg: '#FAFAF8',
          text: '#1A1A1A',
          stone: '#C4A882',
          dark: '#1A1A1A',
          error: '#C0392B',
        },
      },
      fontFamily: {
        heading: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
