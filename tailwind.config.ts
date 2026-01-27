import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Liquid Gold Luxury - Warm black backgrounds
        surface: {
          DEFAULT: '#1A1612', // Deep warm black
          card: '#221E19',    // Slightly lighter warm black
          elevated: '#2A2520', // Elevated surfaces
        },
        // Rich gold palette
        gold: {
          50: '#FFF9E6',
          100: '#FFF0C2',
          200: '#FFE08A',
          300: '#FFD054',
          400: '#F5B832',
          500: '#D4A012', // Primary gold
          600: '#B8860B', // Dark gold
          700: '#956B08',
          800: '#725105',
          900: '#4A3503',
        },
        // Cream accents
        cream: {
          DEFAULT: '#F5F0E6',
          light: '#FAF8F3',
          muted: '#E6DFD1',
        },
        // Semantic colors
        success: {
          DEFAULT: '#4ADE80',
          light: '#86EFAC',
          dark: '#22C55E',
        },
        error: {
          DEFAULT: '#F87171',
          light: '#FCA5A5',
          dark: '#EF4444',
        },
        warning: {
          DEFAULT: '#FBBF24',
          light: '#FDE68A',
          dark: '#F59E0B',
        },
        // Border colors
        border: {
          subtle: '#2E2A24',
          DEFAULT: '#3D3830',
          gold: '#D4A01230',
        },
      },
      zIndex: {
        dropdown: '30',
        modalBackdrop: '40',
        modal: '50',
      },
      backgroundImage: {
        // Rich gold gradients
        'gold-gradient': 'linear-gradient(135deg, #D4A012 0%, #F5B832 50%, #D4A012 100%)',
        'gold-radial': 'radial-gradient(ellipse at top, #D4A01220 0%, transparent 60%)',
        'gold-shine': 'linear-gradient(90deg, transparent, rgba(212, 160, 18, 0.3), transparent)',
        'gold-chart-gradient': 'linear-gradient(180deg, rgba(212, 160, 18, 0.35) 0%, rgba(212, 160, 18, 0) 100%)',
        // Cream gradients
        'cream-gradient': 'linear-gradient(180deg, #F5F0E6 0%, #E6DFD1 100%)',
        // Grain texture overlay
        'grain': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(212, 160, 18, 0.25)',
        'gold-glow-strong': '0 0 50px rgba(212, 160, 18, 0.4)',
        'gold-inner': 'inset 0 1px 0 rgba(212, 160, 18, 0.2)',
        'cream-glow': '0 0 20px rgba(245, 240, 230, 0.15)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 12px 48px rgba(0, 0, 0, 0.5)',
        'luxury': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 160, 18, 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gold-shine': 'gold-shine 4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 160, 18, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 160, 18, 0.4)' },
        },
        'gold-shine': {
          '0%': { transform: 'translateX(-100%)' },
          '50%, 100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
