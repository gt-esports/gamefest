/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "300px",
        md: "700px",
        mlg: "1100px",
        lg: "1200px",
      },
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
        bayon: ["Bayon", "sans-serif"],
        barlow: ["Barlow", "sans-serif"],
      },
      colors: {
        "blue-bright": "#00D4FF",
        "blue-accent": "#0099BB",
        "blue-light": "#0066BB",
        "blue-medium": "#004466",
        "navy-blue": "#0A1628",
        "dark-navy": "#030609",
        "dark-bg": "#0a0f1a",
        "card-bg": "#0d1f2e",
      },
      backgroundImage: {
        "home-1": "url('./assets/home-1.jpg')",
        "normal-streak": "url('./assets/streaks.jpg')",
        streak:
          "linear-gradient(0deg, rgba(22, 34, 57, 0.52) 0%, rgba(0, 0, 0, 0.92) 100%), url('./assets/streaks_4k.png')",
        necard:
          "linear-gradient(180deg, #545454 6.25%, rgba(174, 174, 174, 0.72) 96.87%)",
      },
      backgroundColor: {
        "footer-shadow": "rgba(0, 0, 0, 0.6)", // 60% opacity black
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "scroll-sponsors": "scroll 40s linear infinite",
      },
    },
  },
  plugins: [],
};
