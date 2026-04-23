// eslint.config.js
export default [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
  ...["next/core-web-vitals"].flat(),
];
