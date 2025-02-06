/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "350px",
        md: "900px",
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
    },
  },
  plugins: [],
};
