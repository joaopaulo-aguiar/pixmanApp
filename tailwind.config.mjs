/** @type {import('tailwindcss').Config} */
const config = {
  // darkMode removido, apenas tema escuro
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        base: '1.15rem', // levemente maior
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Exemplo de customização fácil para white label
        primary: {
          DEFAULT: '#2563eb',
          // dark removido
        },
        secondary: {
          DEFAULT: '#64748b',
          // dark removido
        },
      },
    },
  },
  plugins: [],
};
export default config;
