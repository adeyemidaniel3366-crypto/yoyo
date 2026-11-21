/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official zino one Color System (§1)
        scene: {
          turquoise: "#00CEC8",
          cream: "#FCEFC3",
          peach: "#FF9C5F",
          "orange-red": "#EB4203",
          dark: "#12110E",
          surface: "#FFF8DC",
          border: "#EADDA7",
          muted: "#7A735E",
        },
        sidebar: "var(--color-sidebar)",
        topbar: "var(--color-topbar)",
        active: "var(--color-active)",
        "content-bg": "var(--color-content-bg)",
        card: "var(--color-card)",
        heading: "var(--color-heading)",
        body: "var(--color-body)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        // Services
        billstacks: {
          DEFAULT: "var(--color-billstacks)",
          tint: "var(--color-billstacks-tint)",
          dark: "var(--color-billstacks-dark)",
        },
        builders: {
          DEFAULT: "var(--color-builders)",
          accent: "var(--color-builders-accent)",
          tint: "var(--color-builders-tint)",
          dark: "var(--color-builders-dark)",
        },
        spark: {
          DEFAULT: "var(--color-spark)",
          tint: "var(--color-spark-tint)",
          dark: "var(--color-spark-dark)",
        },
        apartments: {
          DEFAULT: "var(--color-apartments)",
          accent: "var(--color-apartments-accent)",
          tint: "var(--color-apartments-tint)",
          dark: "var(--color-apartments-dark)",
        },
        galaxy: {
          DEFAULT: "var(--color-galaxy)",
          slate: "var(--color-galaxy-slate)",
          tint: "var(--color-galaxy-tint)",
          dark: "var(--color-galaxy-dark)",
        },
        visitors: {
          DEFAULT: "var(--color-visitors)",
          tint: "var(--color-visitors-tint)",
          dark: "var(--color-visitors-dark)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  darkMode: "media",
  plugins: [],
};
