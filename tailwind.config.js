import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      fontFamily: {
        sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'fluent': '4px',
        'fluent-lg': '6px'
      },
      boxShadow: {
        'fluent': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'fluent-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'fluent-modal': '0 12px 32px rgba(0, 0, 0, 0.18)',
      }
    },
  },
  plugins: [
    typography,
  ],
}
