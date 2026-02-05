/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/client/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Sustainable forest green palette
          forest: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          // Earthy sage tones
          sage: {
            50: '#f6f7f4',
            100: '#e3e7dd',
            200: '#c8d1be',
            300: '#a6b497',
            400: '#859475',
            500: '#6b7a5a',
            600: '#546146',
            700: '#434d38',
            800: '#384030',
            900: '#30372a',
            950: '#181c14',
          },
          // Warm earth tones
          earth: {
            50: '#faf8f5',
            100: '#f3efe8',
            200: '#e6ddd0',
            300: '#d4c5b0',
            400: '#bfa88d',
            500: '#ae9272',
            600: '#a18162',
            700: '#866a53',
            800: '#6d5747',
            900: '#59483c',
            950: '#2f251f',
          },
          // Accent amber/gold
          accent: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },
          // Neutral slate
          slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
        },
        boxShadow: {
          'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
          'glow-lg': '0 0 40px rgba(34, 197, 94, 0.4)',
          'glow-accent': '0 0 20px rgba(251, 191, 36, 0.3)',
          'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
          'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'mesh': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2322c55e\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        },
        animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'float': 'float 6s ease-in-out infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          }
        }
      },
    },
    plugins: [],
}
