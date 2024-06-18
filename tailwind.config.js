/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // 's-custom': '390px', 
        'xs-custom': '320px',
        'sm-custom': '475px',
        'md-custom': '767px',
      }
    },
  },
  plugins: [],
}
