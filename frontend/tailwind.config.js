/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest': '#2d5a27',
        'moss': '#4a7c3f',
        'safety-orange': '#e85d26',
        'safety-yellow': '#f0a500',
        'earth': '#8b7355',
        'sand': '#c4a882',
        'stone': '#6b5b4f',
        'deep-blue': '#1a3c5e',
        'dark-graphite': '#1e1e1e',
        'dark-forest': '#1a2e1a',
        'danger-red': '#c0392b',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
