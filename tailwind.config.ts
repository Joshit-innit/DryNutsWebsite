import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#4B8F27",
          "green-dark": "#35691B",
          "green-light": "#78B63B",
          "green-emerald": "#4B8F27",
          saffron: "#F6A900",
          "saffron-light": "#FFC64A",
          "saffron-soft": "#FFF3D6",
          gold: "#F6A900",
          orange: "#FF8A00",
          "orange-dark": "#D86E00",
          "orange-soft": "#FFF0DE",
          cream: "#FFFAF2",
          "cream-light": "#FFFFFF",
          beige: "#F6EEE2",
          "beige-dark": "#EBDCC9",
          dark: "#202020",
          "dark-light": "#363636",
          muted: "#777777",
          "muted-light": "#A0A0A0",
          border: "#E9E9E9",
          "border-dark": "#D9D9D9",
        },
        cmd: {
          bg: "#0B0F14",
          card: "#12171F",
          border: "#232A35",
          text: "#D0D7DE",
          muted: "#7D8590",
          accent: "#4BA3E3",
          green: "#3FB950",
          orange: "#D29922",
          red: "#F85149",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-serif)", "Marcellus", "Georgia", "serif"],
        display: ["var(--font-serif)", "Marcellus", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        casanova: ["var(--font-casanova)", "Casanova", "Georgia", "serif"],
        marcellus: ["var(--font-marcellus)", "Marcellus", "Georgia", "serif"],
      },
      letterSpacing: {
        luxury: "0.25em",
        tightest: "0",
        tighter: "0",
        tight: "0",
        wide: "0.04em",
        widest: "0.18em",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.02)" },
        },
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.06)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        marquee: "marquee 40s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        kenburns: "kenburns 22s ease-out forwards",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      borderRadius: {
        "3xl": "24px",
        "2xl": "18px",
        xl: "14px",
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
        hover: "0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.03)",
        glow: "0 0 30px rgba(198, 146, 52, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
