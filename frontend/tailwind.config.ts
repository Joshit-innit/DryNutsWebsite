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
        // Gallery-neutral canvas with charcoal ink; pistachio-forest and honey as the dry-fruit accents.
        brand: {
          green: "#2D4A33",
          "green-dark": "#1E3423",
          "green-light": "#6F8F4E",
          "green-emerald": "#2D4A33",
          saffron: "#946422",
          "saffron-light": "#D2A866",
          "saffron-soft": "#F3E7D1",
          gold: "#B9853C",
          orange: "#9C5B33",
          "orange-dark": "#7E4526",
          "orange-soft": "#F2E3D4",
          cream: "#F5F3EE",
          "cream-light": "#FFFFFF",
          beige: "#EBE7DF",
          "beige-dark": "#DDD7CB",
          dark: "#1D1C1A",
          "dark-light": "#34322E",
          muted: "#6B675F",
          "muted-light": "#A29D93",
          border: "#E4E0D8",
          "border-dark": "#D3CEC3",
          almond: "#E7D9BF",
          ink: "#1D1C1A",
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
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["var(--font-sans)", "-apple-system", "sans-serif"],
        display: ["var(--font-sans)", "-apple-system", "sans-serif"],
        accent: ["var(--font-accent)", "Georgia", "serif"],
        hand: ["var(--font-hand)", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        casanova: ["var(--font-casanova)", "Casanova", "Georgia", "serif"],
        marcellus: ["var(--font-sans)", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.25em",
        tightest: "-0.045em",
        tighter: "-0.035em",
        tight: "-0.02em",
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
        "3xl": "20px",
        "2xl": "16px",
        xl: "12px",
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
        hover: "0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.03)",
        glow: "0 0 30px rgba(185, 133, 60, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
