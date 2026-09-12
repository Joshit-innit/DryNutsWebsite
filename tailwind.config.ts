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
          // Deep Onyx Botanical Forest (Sleek, Modern Luxury)
          green: "#0C1811",
          "green-dark": "#060D09",
          "green-light": "#1B3425",
          "green-emerald": "#164A31",

          // Warm Artisan 24k Gold & Royal Saffron (Precious, Refined)
          saffron: "#C69234",
          "saffron-light": "#DFAB4F",
          "saffron-soft": "#FBF6EC",
          gold: "#D4A340",

          // Roasted Harvest Bronze
          orange: "#B25E2B",
          "orange-dark": "#8F451A",
          "orange-soft": "#FBF2EC",

          // Clean Gallery Canvas & High-End Linen
          cream: "#FBFBFA",
          "cream-light": "#FFFFFF",
          beige: "#F5F5F3",
          "beige-dark": "#ECECE8",

          // Deep Onyx & Obsidian Typography (High Contrast, Ultra-Crisp)
          dark: "#0A0A0A",
          "dark-light": "#1A1A1A",
          muted: "#737373",
          "muted-light": "#999999",

          // Razor-Sharp Architectural Hairlines
          border: "#EAEAEA",
          "border-dark": "#DCDCDC",
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
        serif: ["var(--font-serif)", "Cinzel", "Georgia", "serif"],
        display: ["var(--font-serif)", "Cinzel", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        luxury: "0.25em",
        tightest: "-0.04em",
        tighter: "-0.025em",
        tight: "-0.015em",
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
