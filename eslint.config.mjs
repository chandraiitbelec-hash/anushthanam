import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    // spike/ holds throwaway prototypes with their own toolchains (and
    // generated bundles) — never part of the app, never linted with it.
    ignores: ['.next/**', 'node_modules/**', 'public/**', '.claude/**', 'spike/**'],
  },
];

export default eslintConfig;
