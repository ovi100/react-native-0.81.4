/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    screens: {
      'xs': '385px',
    },
    extend: {
      colors: {
        brand: '#C03221',
        theme: '#3758FA',
        sh: '#060239',
        menu: '#003049',
        tab: '#E3F8FA',
        th: '#7B7890',
        tb: '#d1d5db',
      },
    },
  },
  plugins: [],
}