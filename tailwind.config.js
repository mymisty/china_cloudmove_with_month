/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Microsoft YaHei',
          'PingFang SC',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        climate: '0 22px 70px rgba(20, 88, 130, 0.18)',
      },
    },
  },
  plugins: [],
};
