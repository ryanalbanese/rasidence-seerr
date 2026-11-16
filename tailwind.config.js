// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require('tailwindcss/defaultTheme');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './node_modules/@seerr-team/react-tailwindcss-datepicker/dist/index.esm.js',
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /*
         * Upstream Seerr is built on Tailwind's blue-tinted `gray` scale with an
         * `indigo` accent; Rasidence is neutral `zinc` with a `blue` primary.
         * Remapping the scales here recolors every upstream utility class at
         * once, so components stay untouched and stay easy to rebase.
         */
        gray: colors.zinc,
        indigo: colors.blue,
        /* Shared Rasidence tokens (set on html.dark in rasidence-theme.css) */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      transitionProperty: {
        'max-height': 'max-height',
        width: 'width',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.zinc.300'),
            a: {
              color: theme('colors.indigo.500'),
              '&:hover': {
                color: theme('colors.indigo.400'),
              },
            },

            h1: {
              color: theme('colors.zinc.300'),
            },
            h2: {
              color: theme('colors.zinc.300'),
            },
            h3: {
              color: theme('colors.zinc.300'),
            },
            h4: {
              color: theme('colors.zinc.300'),
            },
            h5: {
              color: theme('colors.zinc.300'),
            },
            h6: {
              color: theme('colors.zinc.300'),
            },

            strong: {
              color: theme('colors.zinc.400'),
            },

            code: {
              color: theme('colors.zinc.300'),
            },

            figcaption: {
              color: theme('colors.zinc.500'),
            },
          },
        },
      }),
    },
    aspectRatio: {
      auto: 'auto',
      square: '1 / 1',
      video: '16 / 9',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
      13: '13',
      14: '14',
      15: '15',
      16: '16',
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
