/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // CampusBridge Core Palette
        midnight: "#14213D",
        charcoal: "#26334A",
        deepIndigo: "#4F46E5",
        electricIndigo: "#6366F1",
        tealAccent: "#14B8A6",
        // Pastel Accent Cards & Badges
        pastelPeach: "#F8DCCF",
        softPink: "#F7DCE8",
        lavender: "#DCD5FA",
        softGreen: "#D9EEE4",
        calmBlue: "#D8EAFB",
        // Foundations
        canvasLight: "#F5F3FF",
        cbSurface: "#FFFFFF",
        primaryText: "#172033",
        secondaryText: "#64748B",
        cbBorder: "#E5E7EB",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(20, 33, 61, 0.08)",
        card: "0 4px 20px -2px rgba(79, 70, 229, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

