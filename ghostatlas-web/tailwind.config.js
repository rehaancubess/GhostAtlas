/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'ghost-black': '#000000',
        'ghost-near-black': '#0A0A0A',
        'ghost-green': '#00FF41',
        'ghost-red': '#FF0040',
        'ghost-red-dark': '#CC0033',
        'ghost-gray': '#E0E0E0',
        'ghost-white': '#FFFFFF',
        'ghost-dark-gray': '#1A1A1A',
        'ghost-medium-gray': '#333333',
      },
      fontFamily: {
        'creepster': ['Creepster', 'cursive'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'green-glow': '0 0 10px rgba(0, 255, 65, 0.5)',
        'green-glow-md': '0 0 15px rgba(0, 255, 65, 0.5)',
        'green-glow-lg': '0 0 20px rgba(0, 255, 65, 0.6)',
        'green-glow-xl': '0 0 30px rgba(0, 255, 65, 0.7)',
        'red-glow': '0 0 10px rgba(255, 0, 64, 0.5)',
        'red-glow-md': '0 0 15px rgba(255, 0, 64, 0.5)',
        'red-glow-lg': '0 0 20px rgba(255, 0, 64, 0.6)',
        'red-glow-xl': '0 0 30px rgba(255, 0, 64, 0.7)',
        'vignette': 'inset 0 0 100px rgba(0, 0, 0, 0.8)',
        'vignette-lg': 'inset 0 0 150px rgba(0, 0, 0, 0.9)',
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-in-slow': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.8)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      // Responsive utility classes
      maxWidth: {
        'mobile': '640px',
        'tablet': '768px',
        'desktop': '1024px',
      },
      minHeight: {
        'screen-mobile': '100vh',
        'screen-tablet': '100vh',
        'screen-desktop': '100vh',
      },
    },
  },
  plugins: [],
}
