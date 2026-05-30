/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // Override Tailwind gray with warm tones — impacta toda la app
        gray: {
          50:  '#FAF6F2',
          100: '#F4EDE5',
          200: '#E8DDD4',
          300: '#D0C4B8',
          400: '#B0A095',
          500: '#8E7D72',
          600: '#6E5F55',
          700: '#52453C',
          800: '#352C25',
          900: '#1C1510',
        },
        carmen: {
          50:  '#fef4ef',
          100: '#fde5d8',
          200: '#fbcab2',
          300: '#f7a07e',
          400: '#e97752',
          500: '#C4614A',
          600: '#a84d39',
          700: '#8a3d2c',
          800: '#6b2e20',
          900: '#4d2016',
        },
        salon: {
          50:  '#f5f0fb',
          100: '#ebe0f7',
          200: '#d4bff0',
          300: '#b594e4',
          400: '#9b78d4',
          500: '#7B5EA7',
          600: '#6347a0',
          700: '#4d3580',
          800: '#38266a',
          900: '#261856',
        },
        store: {
          50:  '#fdf5e6',
          100: '#fae9c3',
          200: '#f4d38a',
          300: '#e9b848',
          400: '#d49838',
          500: '#B8782A',
          600: '#956020',
          700: '#724a18',
          800: '#503512',
          900: '#33220b',
        },
      },
    },
  },
  plugins: [],
}
