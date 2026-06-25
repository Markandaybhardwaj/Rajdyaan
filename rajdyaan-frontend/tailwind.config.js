/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B1F0A",
        secondary: "#FAF6EE",
        accent: "#B5922A",
        support: "#5C6B34",
        dark: "#1A1A1A",
        white: "#FFFFFF",
      },
      fontFamily: {
        heading: ['Playfair Display', 'Lora', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
