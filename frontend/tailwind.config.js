/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dynamic Institutional Palette driven by CSS Variables
        primary: {
          DEFAULT: 'var(--primary-color)',
          dark: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          border: 'var(--primary-border)',
          50: 'var(--primary-light)',
          200: 'var(--primary-border)',
          700: 'var(--primary-color)',
          900: 'var(--primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          light: 'var(--secondary-color)',
          dark: 'var(--primary-color)',
        },
        surface: {
          DEFAULT: 'var(--bg-surface)',
          soft: 'var(--bg-soft)',
          alt: 'var(--bg-hover)',
          card: 'var(--bg-card)',
          border: 'var(--border-color)',
        },
        ink: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          light: 'var(--text-light)',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-danger)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'inst-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'inst': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'inst-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.06)',
        'inst-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
