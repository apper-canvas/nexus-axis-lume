/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3'
        },
        secondary: {
          500: '#6366f1'
        },
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669'
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b'
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}