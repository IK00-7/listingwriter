/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e1a',
          card: '#141824',
          border: '#1f2937',
        },
        primary: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
      },
    },
  },
  plugins: [],
}