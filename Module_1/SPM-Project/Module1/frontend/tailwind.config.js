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
        primary: {
          DEFAULT: '#001736',
          text: '#e8eaed',
        },
        surface: {
          DEFAULT: '#f9f9ff',
          dark: '#00132e',
          container: '#e7eeff',
          'container-dark': '#001b3d',
        },
        accent: {
          DEFAULT: '#89f5e7',
          hover: '#6ee7d7',
        },
        border: {
          DEFAULT: '#e1e2e9',
          dark: 'rgba(137, 245, 231, 0.12)',
        }
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
      },
      letterSpacing: {
        'label': '0.08em',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
