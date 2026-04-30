/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#2B5D3A',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: '#4A90E2',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: '#F5A623',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Adventure theme colors
        adventure: {
          orange: 'hsl(var(--adventure-orange))',
          blue: 'hsl(var(--adventure-blue))',
          green: 'hsl(var(--adventure-green))',
          gold: 'hsl(var(--adventure-gold))',
          pink: 'hsl(var(--adventure-pink))',
          parchment: 'hsl(var(--adventure-parchment))',
          brown: 'hsl(var(--adventure-brown))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        bubble: '1.5rem',
      },
      fontFamily: {
        hand: ['var(--font-hand)'],
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        'doodle': '3px 3px 0px hsl(var(--adventure-brown) / 0.3)',
        'doodle-lg': '4px 4px 0px hsl(var(--adventure-brown) / 0.3)',
        'card-warm': '0 4px 16px hsl(var(--adventure-orange) / 0.15)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
