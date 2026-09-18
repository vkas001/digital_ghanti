/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: '#F59E0B',
        'accent-strong': '#FBBF24',
        'accent-soft': '#92400E',
      },
    },
  },
  plugins: [],
};