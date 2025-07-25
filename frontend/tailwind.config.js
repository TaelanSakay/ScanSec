/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        background: '#f8f9fa',
        card: '#ffffff',
        textPrimary: '#374151',
        textSecondary: '#6b7280',
        status: {
          critical: '#dc2626',
          high: '#ea580c',
          medium: '#f59e0b',
          low: '#16a34a',
          info: '#2563eb',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

