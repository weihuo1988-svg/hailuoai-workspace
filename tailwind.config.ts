import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "480px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        adventure: {
          orange: "hsl(var(--adventure-orange))",
          blue: "hsl(var(--adventure-blue))",
          green: "hsl(var(--adventure-green))",
          gold: "hsl(var(--adventure-gold))",
          pink: "hsl(var(--adventure-pink))",
          parchment: "hsl(var(--adventure-parchment))",
          brown: "hsl(var(--adventure-brown))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        bubble: "1.5rem",
        blob: "30% 70% 70% 30% / 30% 30% 70% 70%",
      },
      fontFamily: {
        hand: ['var(--font-hand)'],
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "stamp-in": {
          "0%": { transform: "scale(3) rotate(-15deg)", opacity: "0" },
          "60%": { transform: "scale(0.9) rotate(5deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-3deg)", opacity: "1" },
        },
        "chest-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "chest-open": {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(-120deg)" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1) rotate(180deg)" },
        },
        "path-draw": {
          "0%": { strokeDashoffset: "var(--path-length)" },
          "100%": { strokeDashoffset: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "80%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "confetti": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-200px) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "stamp-in": "stamp-in 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards",
        "chest-bounce": "chest-bounce 1.5s ease-in-out infinite",
        "chest-open": "chest-open 0.6s ease-out forwards",
        "sparkle": "sparkle 1.5s ease-in-out infinite",
        "path-draw": "path-draw 2s ease-in-out forwards",
        "float": "float 3s ease-in-out infinite",
        "wiggle": "wiggle 2s ease-in-out infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "confetti": "confetti 1s ease-out forwards",
      },
      boxShadow: {
        'doodle': '3px 3px 0px hsl(var(--adventure-brown) / 0.3)',
        'doodle-lg': '4px 4px 0px hsl(var(--adventure-brown) / 0.3)',
        'card-warm': '0 4px 16px hsl(var(--adventure-orange) / 0.15)',
        'card-hover': '0 8px 24px hsl(var(--adventure-orange) / 0.25)',
        'stamp': '2px 2px 4px hsl(var(--adventure-brown) / 0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
