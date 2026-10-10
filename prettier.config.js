// Prettier's defaults are good, so we only list what we change.
// The comment below lets the editor autocomplete and type-check the options.

/** @type {import("prettier").Config} */
export default {
  // Lines may be up to 100 characters (the default is 80, which wraps TypeScript a lot).
  printWidth: 100,
  // No semicolons at the ends of statements.
  semi: false,
  // 'single' quotes in JS/TS. JSX attributes keep "double" quotes (jsxSingleQuote is off by default).
  singleQuote: true,
  // Sorts Tailwind classes into Tailwind's own order (layout, then spacing, then colours...,
  // with variants like hover: last), so the same classes always read the same way and
  // diffs don't show reorderings.
  plugins: ['prettier-plugin-tailwindcss'],
  // Tailwind v4 has no JS config: the plugin reads our CSS to learn our own classes.
  tailwindStylesheet: './src/styles/app.css',
}
