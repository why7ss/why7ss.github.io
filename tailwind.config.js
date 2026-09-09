/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#09090B',
        surface: '#121215',
        surface2: '#17171B',
        line: 'rgba(255,255,255,0.1)',
        ink: '#F4F3EE',
        muted: '#8B8B93',
        accent: {
          DEFAULT: '#6B9080',
          dim: '#4C6B5D',
          bright: '#8FB29E',
        },
        rust: '#A9714F',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        '10xl': ['9rem', { lineHeight: '0.95' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
