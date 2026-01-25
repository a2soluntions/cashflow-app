/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cores baseadas na sua logo
        brand: {
          orange: '#FF8A00', // Laranja vibrante
          green: '#22C55E',  // Verde saudável
          black: '#000000',
          dark: '#0A0A0A',   // Cinza quase preto para cards
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}