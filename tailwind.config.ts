import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: "#2B2539",
        oatmeal: "#EBE9E4",
        sea: {
          DEFAULT: "#BED3CC",
          deep: "#7FA394",
        },
        coral: {
          DEFAULT: "#EFC8C8",
          deep: "#C98D8D",
          text: "#7A3D3D",
        },
        umber: {
          DEFAULT: "#7B6767",
          deep: "#5A4A4A",
          light: "#A08D8D",
        },
        chartreuse: "#EEEFC8",
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        "muted-2": "var(--muted-2)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        accent: "var(--accent)",
        "accent-fg": "var(--accent-fg)",
        "accent-hover": "var(--accent-hover)",
        warm: "var(--warm)",
        "ledge-a": "var(--ledge-a)",
        "ledge-b": "var(--ledge-b)",
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
