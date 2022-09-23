/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e3fde3",
          100: "#bcf4bc",
          200: "#93ea98",
          300: "#69e273",
          400: "#41da52",
          500: "#28c03d",
          600: "#1d9633",
          700: "#126b1d",
          800: "#06400c",
          900: "#041700",
        },
      },
    },
  },
  plugins: [],
};
