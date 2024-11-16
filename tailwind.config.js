/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors : {
       "primary": "#3A7CA5",
       "secondary": "#2A5674",
      }
    },
  },
  plugins: [],
}

