/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        indigo: '#000080',
        peacock: '#005F73',
        heritage: {
          orange: '#FF9933',
          white: '#FFFFFF',
          green: '#138808',
          navy: '#000080',
          maroon: '#800000',
        }
      },
      fontFamily: {
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
