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
          teal: '#00B5B8',
          tealDark: '#0D4B55',
          tealLight: '#E6F8F8',
          orange: '#F98600',
          blue: '#1864E6',
          darkBlue: '#0A3B82',
          bgMain: '#F4F7FB',
          cardBg: '#FFFFFF',
          graySub: '#828B9E'
        }
      },
      boxShadow: {
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 10px -2px rgba(0, 0, 0, 0.02)',
        'pill': '0 8px 18px -3px rgba(0, 0, 0, 0.12)',
        'badge': '0 4px 12px rgba(13, 75, 85, 0.25)'
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
