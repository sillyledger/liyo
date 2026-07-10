import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16140E",
          2: "#1E1B13",
          3: "#262218",
        },
        paper: "#F3EEE1",
        muted: "#A29C8B",
        leaf: {
          DEFAULT: "#5EC97A",
          bright: "#7BE49A",
          deep: "#2C7B45",
        },
        amber: "#E8B45A",
        line: "rgba(243,238,225,0.09)",
        line2: "rgba(243,238,225,0.14)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        settle: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        eq: {
          "0%,100%": { transform: "scaleY(0.55)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        settle: "settle 0.7s cubic-bezier(0.2,0.7,0.3,1) forwards",
        eq: "eq 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;