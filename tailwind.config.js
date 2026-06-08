/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // class-based only — never respond to system preference
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#e0e7ff' },
        accent:  '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
        surface: { DEFAULT: '#ffffff', 2: '#f1f5f9' },
        border:  '#e2e8f0',
        muted:   '#64748b',
        ink:     '#0f172a',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)',
        md:   '0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06)',
        lg:   '0 10px 30px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)',
      },
    },
  },
  plugins: [],
}
