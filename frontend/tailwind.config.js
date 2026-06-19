/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ae1975ef",
        foreground: "#ffffff",
        card: "rgba(255, 255, 255, 0.05)",
        "card-hover": "rgba(255, 255, 255, 0.1)",
        accent: "#0071e3", # Apple Blue
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'mesh': "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(253, 41%, 49%, 1.00) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
