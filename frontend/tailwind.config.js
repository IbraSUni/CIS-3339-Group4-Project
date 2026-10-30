/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // UH red, the app's only accent color. 700 is the brand red used for
        // the sidebar and primary buttons; lighter steps are for tints.
        brand: {
          50: '#fdf2f3',
          100: '#fbe3e6',
          200: '#f6c7cd',
          300: '#ec9aa5',
          500: '#dc3a50',
          600: '#c8102e',
          700: '#a80d26',
          800: '#8a0b20',
          900: '#5c0715'
        }
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif']
      },
      boxShadow: {
        // soft, slightly warm shadow instead of pure black
        card: '0 1px 2px rgb(68 64 60 / 0.06), 0 1px 3px rgb(68 64 60 / 0.08)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
