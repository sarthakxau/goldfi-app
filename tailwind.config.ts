import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Light mode surfaces
        surface: {
          DEFAULT: '#F5F5F5',
          card: '#FFFFFF',
          elevated: '#F0F0F0',
        },
        // Refined gold palette
        gold: {
          50: '#FFF9E6',
          100: '#FFF0C2',
          200: '#FFE08A',
          300: '#FFD054',
          400: '#D4A012',
          500: '#B8860B', // Primary gold
          600: '#956B08',
          700: '#725105',
          800: '#4A3503',
          900: '#2D2001',
        },
        // Text colors
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          inverse: '#FFFFFF',
        },
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        // Border colors
        border: {
          subtle: '#E5E7EB',
          DEFAULT: '#D1D5DB',
          gold: '#B8860B30',
        },
      },
      zIndex: {
        dropdown: '30',
        modalBackdrop: '40',
        modal: '50',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4A012 0%, #F5B832 50%, #D4A012 100%)',
        'gold-chart-gradient': 'linear-gradient(180deg, rgba(184, 134, 11, 0.2) 0%, rgba(184, 134, 11, 0) 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'nav': '0 -1px 3px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
