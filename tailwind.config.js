/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  // Tailwind CSS v4 optimizations
  ...(process.env.NODE_ENV === 'production' && {
    safelist: ['text-green-600', 'text-5xl'], // Add critical classes that shouldn't be purged
  })
};
