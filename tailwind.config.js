/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#0a0a0a', graphite: '#1c1c1e', steel: '#2a2a2d', mute: '#9a9a9f', accent: '#d7263d' },
      fontFamily: { display: ['"Archivo Black"', 'Impact', 'sans-serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
