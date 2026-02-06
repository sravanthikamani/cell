/** @type {import('tailwindcss').Config} */
export default {
   darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
 theme: {
  extend: {
    keyframes: {
      slideInLeft: {
        "0%": { transform: "translateX(100%)" },
        "100%": { transform: "translateX(0)" },
      },
      slideInRight: {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(0)" },
      },
    },
    animation: {
      "slide-in-left": "slideInLeft 0.5s ease-out",
      "slide-in-right": "slideInRight 0.5s ease-out",
    },
  },
},

  plugins: [],
};
