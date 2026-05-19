/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary':   '#0B0F17',
        'bg-surface':   '#141826',
        'bg-elevated':  '#1B2133',

        // Brand
        primary: {
          DEFAULT: '#6C5CE7',
          light:   '#8B7FF0',
          dark:    '#4E42C4',
        },
        secondary: {
          DEFAULT: '#00D1FF',
          light:   '#33DAFF',
          dark:    '#00A8CC',
        },
        accent: {
          DEFAULT: '#2EE59D',
          light:   '#5EEDB3',
          dark:    '#1EC27E',
        },

        // Text
        'text-primary':   '#FFFFFF',
        'text-secondary': '#B8C1D1',
        'text-tertiary':  '#7B8496',
        'text-disabled':  '#4A5260',

        // Semantic
        success: '#2EE59D',
        warning: '#FFB347',
        error:   '#FF6B6B',
      },

      fontFamily: {
        sans:  ['Inter-Regular', 'sans-serif'],
        medium: ['Inter-Medium', 'sans-serif'],
        bold:  ['Inter-Bold', 'sans-serif'],
        mono:  ['JetBrainsMono-Regular', 'monospace'],
      },

      borderRadius: {
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
