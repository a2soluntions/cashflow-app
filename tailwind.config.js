/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Paleta A2 Mentor Premium ──────────────────────────────
        brand: {
          primary:  '#6C63FF',  // violeta premium
          'primary-h': '#8B84FF',
          accent:   '#00D4AA',  // verde-água
          'accent-h': '#00EDBC',
          danger:   '#FF4757',  // vermelho suave
          gold:     '#FFD60A',  // âmbar/gold
          warning:  '#FF9F43',  // laranja aviso
          orange:   '#FF5722',  // legado
          green:    '#00E676',  // legado
          purple:   '#D500F9',  // legado
          black:    '#000001',  // legado
          dark:     '#0D0E1A',  // dark navy
          card:     '#141527',  // card dark
          surface:  '#1C1D35',  // surface dark
          blue:     'rgb(var(--color-brand-blue, 16 35 255) / <alpha-value>)',
        },

        // ── Overrides para compatibilidade legada ─────────────────
        indigo: {
          400: 'rgb(var(--color-primary-400, 108 99 255) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500, 92 83 255) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600, 76 67 240) / <alpha-value>)',
          950: '#0D0E1A',
        },
        blue: {
          400: 'rgb(var(--color-primary-400, 96 165 250) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500, 59 130 246) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600, 37 99 235) / <alpha-value>)',
        },
        emerald: {
          400: 'rgb(var(--color-secondary-400, 0 212 170) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500, 0 200 158) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600, 0 180 140) / <alpha-value>)',
        },
        purple: {
          400: 'rgb(var(--color-tertiary-400, 139 132 255) / <alpha-value>)',
          500: 'rgb(var(--color-tertiary-500, 108 99 255) / <alpha-value>)',
          600: 'rgb(var(--color-tertiary-600, 92 83 240) / <alpha-value>)',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)',
        'grad-card':    'linear-gradient(145deg, rgba(108,99,255,0.08) 0%, rgba(0,212,170,0.04) 100%)',
        'grad-danger':  'linear-gradient(135deg, #FF4757 0%, #D500F9 100%)',
      },
      boxShadow: {
        'primary': '0 0 30px rgba(108,99,255,0.25)',
        'accent':  '0 0 30px rgba(0,212,170,0.20)',
        'card':    '0 4px 24px rgba(0,0,0,0.3)',
        'glow-sm': '0 0 12px rgba(108,99,255,0.4)',
        'glow-lg': '0 0 40px rgba(108,99,255,0.5)',
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}