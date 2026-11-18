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
        sidebar: "#14142B",
        topbar: "#1A1A2E",
        active: "#4F46E5",
        "content-bg": "#F4F6FB",
        card: "#FFFFFF",
        heading: "#1A1A2E",
        body: "#4A4A5A",
        muted: "#8A8A9A",
        border: "#E9ECEF",
        success: "#28A745",
        warning: "#FFB800",
        danger: "#DC3545",
        info: "#17A2B8",
        // Services
        billstacks: {
          DEFAULT: "#28A745",
          tint: "#E8F5EE",
          dark: "#1b6d2f",
        },
        builders: {
          DEFAULT: "#006B3F",
          accent: "#FFB800",
          tint: "#E8F5EE",
          dark: "#004d2c",
        },
        spark: {
          DEFAULT: "#2563EB",
          tint: "#E8EEFB",
          dark: "#1d4ed8",
        },
        apartments: {
          DEFAULT: "#1E3A5F",
          accent: "#D4A843",
          tint: "#E8EEF5",
          dark: "#13253d",
        },
        galaxy: {
          DEFAULT: "#E74C3C",
          slate: "#2C3E50",
          tint: "#FDF2F2",
          dark: "#c0392b",
        },
        visitors: {
          DEFAULT: "#7C3AED",
          tint: "#F3EFFF",
          dark: "#5b21b6",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
