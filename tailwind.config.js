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
        indigo: {
          400: 'rgb(var(--color-primary-400, 129 140 248) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500, 99 102 241) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600, 79 70 229) / <alpha-value>)',
        },
        blue: {
          400: 'rgb(var(--color-primary-400, 96 165 250) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500, 59 130 246) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600, 37 99 235) / <alpha-value>)',
        },
        emerald: {
          400: 'rgb(var(--color-secondary-400, 52 211 153) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500, 16 185 129) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600, 5 150 105) / <alpha-value>)',
        },
        purple: {
          400: 'rgb(var(--color-tertiary-400, 192 132 252) / <alpha-value>)',
          500: 'rgb(var(--color-tertiary-500, 168 85 247) / <alpha-value>)',
          600: 'rgb(var(--color-tertiary-600, 147 51 234) / <alpha-value>)',
        },
        brand: {
          orange: '#FF5722',
          green: '#00E676',
          purple: '#D500F9',
          black: '#000001',
          dark: '#0A0A0A',
          blue: 'rgb(var(--color-brand-blue, 16 35 255) / <alpha-value>)',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}