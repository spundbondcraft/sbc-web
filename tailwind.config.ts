import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sbc-orange': '#E8470A',
        'sbc-green': '#7AB611',
        'sbc-dark': '#0D1F00',
        'sbc-mid': '#5A8A0A',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config
