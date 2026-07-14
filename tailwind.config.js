/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',     // Deep Navy Black
        darkCard: '#131926',   // Navy Blue Dark Card
        darkGlass: 'rgba(19, 25, 38, 0.65)',
        brandPurple: '#8b5cf6', // Indigo-Purple accent
        brandGlow: '#6366f1',   // Electric Indigo
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.4)',
        'glow-indigo': '0 0 15px rgba(99, 102, 241, 0.4)',
      },
      borderWidth: {
        'glass': '1px',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
