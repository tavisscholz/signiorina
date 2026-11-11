// Tailwind CSS v4 through PostCSS, the setup in Next.js's CSS guide. It works with both bundlers:
// Turbopack in development and the webpack production build (see package.json).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
