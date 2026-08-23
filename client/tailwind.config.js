/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    '!./src/**/*.test.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: 'oklch(7% 0.022 265)',
          raised: 'oklch(8% 0.020 265)',
          card: 'oklch(10% 0.022 265)',
          input: 'oklch(11% 0.022 265)',
        },
        edge: {
          subtle: 'oklch(13% 0.020 265)',
          DEFAULT: 'oklch(18% 0.022 265)',
          strong: 'oklch(22% 0.025 265)',
        },
        brand: {
          DEFAULT: 'oklch(76% 0.19 55)',
          hover: 'oklch(81% 0.2 55)',
          ink: 'oklch(10% 0.02 55)',
        },
        accent: {
          DEFAULT: 'oklch(62% 0.24 280)',
          hover: 'oklch(67% 0.24 280)',
        },
        content: {
          DEFAULT: 'oklch(96% 0.005 265)',
          muted: 'oklch(56% 0.013 265)',
          subtle: 'oklch(42% 0.013 265)',
          faint: 'oklch(32% 0.013 265)',
        },
        metacritic: 'oklch(72% 0.18 145)',
        status: {
          backlog: 'oklch(58% 0.04 265)',
          playing: 'oklch(62% 0.18 250)',
          completed: 'oklch(76% 0.19 55)',
          dropped: 'oklch(58% 0.18 18)',
          wishlist: 'oklch(62% 0.20 300)',
        },
      },
      keyframes: {
        floatA: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-7deg)' },
          '50%': { transform: 'translateY(-16px) rotate(-7deg)' },
        },
        floatB: {
          '0%, 100%': { transform: 'translateY(6px) rotate(3deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        floatC: {
          '0%, 100%': { transform: 'translateY(10px) rotate(11deg)' },
          '50%': { transform: 'translateY(-10px) rotate(11deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        floatA: 'floatA 5.2s ease-in-out infinite',
        floatB: 'floatB 6.8s ease-in-out infinite',
        floatC: 'floatC 7.6s ease-in-out infinite',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
