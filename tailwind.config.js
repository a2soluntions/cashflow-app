/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- ADICIONE ESTA LINHA AQUI
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}