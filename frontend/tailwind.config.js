/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores para Pipón Appétit
        primary: {
          50: '#FFF5F0',
          100: '#FFE4D6',
          200: '#F5D5C8',
          300: '#F0C7B8',
          400: '#FF8C42',
          500: '#FF6B1A',
          600: '#E55A16',
          700: '#CC4911',
          800: '#B3390C',
          900: '#8B4513',
        },
        brown: {
          50: '#F7F3F0',
          100: '#E8DDD6',
          200: '#D2C4B8',
          300: '#B8A898',
          400: '#9C8A77',
          500: '#8B4513',
          600: '#7A3C10',
          700: '#68330E',
          800: '#572A0B',
          900: '#452208',
        },
        accent: {
          50: '#FFF8E1',
          100: '#FFEAA7',
          200: '#FFD93D',
          300: '#FFB8B8',
          400: '#FF6B6B',
          500: '#E55656',
        }
      },
      fontFamily: {
        sans: ['System', 'ui-sans-serif'],
      },
    },
  },
  plugins: [],
}