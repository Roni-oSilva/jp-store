/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // painel admin (escuro)
        ink: '#0a0a0a', graphite: '#1c1c1e', steel: '#2a2a2d', mute: '#9a9a9f', accent: '#d7263d',
        // loja (claro, estilo app)
        paper: '#f4f4f6', soft: '#ebebee', charcoal: '#313135', txt: '#17171a', sub: '#8c8c94',
      },
      fontFamily: { display: ['"Archivo Black"', 'Impact', 'sans-serif'], sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
