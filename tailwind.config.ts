import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DMSans'],
        'dm-sans': ['DMSans'],
      },
      colors: {
        // Light mode surfaces
        surface: {
          DEFAULT: '#F5F5F5',
          card: '#FFFFFF',
          elevated: '#F0F0F0',
        },
        // Dark mode surfaces (used via dark: prefix)
        'surface-dark': {
          DEFAULT: '#0F0F0F',
          card: '#1A1A1A',
          elevated: '#242424',
        },
        // Refined gold palette
        gold: {
          50: '#FFF9E6',
          100: '#FFF0C2',
          200: '#FFE08A',
          300: '#FFD054',
          400: '#D4A012',
          500: '#B8860B',
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
        // Dark mode text
        'text-dark': {
          primary: '#F0F0F0',
          secondary: '#9CA3AF',
          muted: '#6B7280',
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
          gold: 'rgba(184, 134, 11, 0.19)',
        },
        'border-dark': {
          subtle: '#2D2D2D',
          DEFAULT: '#3D3D3D',
        },
      },
    },
  },
  plugins: [],
};

export default config;
