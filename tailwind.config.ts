import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // すべて globals.css の CSS 変数を参照。ライト/ダークは .dark クラスで切替。
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-strong': 'rgb(var(--c-ink-strong) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        rule: 'rgb(var(--c-rule) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        link: 'rgb(var(--c-link) / <alpha-value>)',
        up: 'rgb(var(--c-up) / <alpha-value>)',
        down: 'rgb(var(--c-down) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Shippori Mincho"', '"Noto Serif JP"', '"Hiragino Mincho ProN"', '"Yu Mincho"', 'serif'],
        sans: ['"Noto Sans JP"', '"Hiragino Kaku Gothic ProN"', '"Yu Gothic"', 'sans-serif'],
      },
      maxWidth: {
        column: '46rem',
        wide: '72rem',
      },
    },
  },
  plugins: [typography],
};

export default config;
