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
          "green-dark": "#386D1C",
          "green-light": "#78B63B",
          saffron: "#F6A900",
          orange: "#FF8A00",
          "orange-dark": "#E67800",
          cream: "#FFFAF2",
          "cream-light": "#FFFDF9",
          beige: "#F6EEE2",
          "beige-dark": "#ECE1D1",
          dark: "#202020",
          "dark-light": "#333333",
          muted: "#777777",
          "muted-light": "#A0A0A0",
          border: "#E9E9E9",
          "border-dark": "#D5D5D5",
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
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        marquee: "marquee 30s linear infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(0, 0, 0, 0.04)",
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
        hover: "0 14px 40px rgba(75, 143, 39, 0.12)",
        glow: "0 0 25px rgba(246, 169, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
