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
        brand: {
          orange: '#FF5722', // Neon orange
          green: '#00E676',  // Neon green
          purple: '#D500F9', // Neon purple
          black: '#000001',
          dark: '#0A0A0A',
          blue: '#1023FF',   // Deep blue
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}