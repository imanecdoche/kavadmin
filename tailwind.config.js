import defaultTheme from 'tailwindcss/defaultTheme'
import typography from '@tailwindcss/typography'
import tailwindAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
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
        fluent: {
          blue: "#0078D4",
          blueHover: "#1084D8",
          blueActive: "#005A9E",
          bg: "#F3F3F3",
          surface: "#FFFFFF",
          subtle: "#F9F9F9",
          border: "#E5E5E5",
          borderDark: "#CCCCCC",
          text: "#1A1A1A",
          textSecondary: "#616161",
          acrylic: "rgba(255, 255, 255, 0.85)",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#F43F5E"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'fluent': '4px',
        'fluent-lg': '6px'
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'fluent': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'fluent-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'fluent-modal': '0 12px 32px rgba(0, 0, 0, 0.18)',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    typography,
    tailwindAnimate,
  ],
}

