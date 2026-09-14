/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#112f23',
          darker: '#0d261c',
          card: '#16382a',
          lime: '#B7F143',
          limeLight: '#D4F788',
          limeBg: '#D8F485',
          surface: '#F4F7F6',
          muted: '#7A8F84',
          softGray: '#E9EFEA',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 24px -4px rgba(0, 0, 0, 0.04)',
        'card-sm': '0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'pop': '0 12px 30px rgba(18, 48, 35, 0.08)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
