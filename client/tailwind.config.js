/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF3',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A', // Primary brand green
          700: '#15803D', // Hover green
          800: '#166534', // Pressed green
          900: '#14532D', // Deep green headings/accents
          950: '#052e16',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F6FBF7',
          card: '#FFFFFF',
          border: '#E3EFE6',
          muted: '#F0F7F2',
        },
        content: {
          primary: '#0F1F14',
          secondary: '#4B5F52',
          muted: '#6E8275',
          light: '#94A89C',
        },
        risk: {
          low: '#16A34A',
          'low-bg': '#ECFDF3',
          'low-border': '#A7F3D0',
          medium: '#D97706',
          'medium-bg': '#FFFBEB',
          'medium-border': '#FDE68A',
          high: '#DC2626',
          'high-bg': '#FEF2F2',
          'high-border': '#FECACA',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(15, 31, 20, 0.04)',
        'card': '0 4px 20px -2px rgba(22, 163, 74, 0.06), 0 2px 6px -1px rgba(15, 31, 20, 0.04)',
        'elevated': '0 12px 30px -4px rgba(20, 83, 45, 0.08)',
      },
    },
  },
  plugins: [],
}
