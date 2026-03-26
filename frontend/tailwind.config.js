/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB954',
        spotifyBlack: '#191414',
        spotifyDark: '#121212',
        spotifyLight: '#282828',
        spotifyGrey: '#B3B3B3',
      }
    },
  },
  plugins: [],
}
