/** @type {import('tailwindcss').Config} */

// import plugin from 'tailwindcss/plugin'; /**/

// const plugin = require("tailwindcss/plugin");

// const RotateY = plugin(function ({ addUtilities }) {
//   addUtilities({
//     ".rotate-y-180": {
//       transform: "rotateY(180deg)",
//     },
//   });
// });

// module.exports = {

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        bounce: {
          "0%, 100%": {
            transform: "translateY(-10%)",
          },
          "50%": {
            transform: "translateY(0)",
          },
        },
        bounce1: {
          "0%, 100%": {
            transform: "translateY(0%)",
          },
          "50%": {
            transform: "translateY(-7%)",
          },
        },
      },
      animation: {
        bouncing: "bounce 1s linear infinite",
        bouncing1: "bounce1 1s linear infinite",
      },
      fontFamily: {
        poppins: ["poppins", "sans-serif"],
        // 'sans': [your_main_font],
      // 'roboto': ['Roboto', 'sans-serif'],
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
};
