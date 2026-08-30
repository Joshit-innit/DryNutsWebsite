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
          green: "#2F4A38",
          "green-dark": "#1F3327",
          "green-light": "#5C7A62",
          saffron: "#C4A574",
          orange: "#B86A45",
          "orange-dark": "#9A5436",
          cream: "#F7F1E8",
          "cream-light": "#FBF7F1",
          beige: "#EDE4D6",
          "beige-dark": "#E0D4C2",
          dark: "#1A1612",
          "dark-light": "#2C2620",
          muted: "#6F675D",
          "muted-light": "#9A9288",
          border: "#E5DCD0",
          "border-dark": "#D4C9BA",
        },
        cmd: {
          bg: "#0D1117",
          card: "#161B22",
          border: "#30363D",
          text: "#C9D1D9",
          muted: "#8B949E",
          accent: "#58A6FF",
          green: "#3FB950",
          orange: "#D29922",
          red: "#F85149",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        luxury: "0.28em",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        marquee: "marquee 40s linear infinite",
        float: "float 5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        kenburns: "kenburns 18s ease-out forwards",
        "fade-up": "fadeUp 0.8s ease-out both",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        subtle: "0 2px 16px rgba(26, 22, 18, 0.04)",
        card: "0 18px 50px rgba(26, 22, 18, 0.08)",
        hover: "0 24px 60px rgba(47, 74, 56, 0.14)",
        glow: "0 0 40px rgba(196, 165, 116, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
