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
        "tech-gold": "#B3A369",
        "navy-blue": "#003057",
        "bright-buzz": "#FFCC00",
        "light-purple": "#241F3F",
        "dark-purple": "#0D072B",
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
