// eslint.config.js — корневой конфиг ESLint (flat config, ESLint 9).
// TypeScript-воркспейсы (apps/api, packages/shared) линтятся через typescript-eslint;
// apps/web использует собственный `next lint` (см. скрипты воркспейса).
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/pgdata/**',
    ],
  },
  {
    files: ['apps/api/**/*.ts', 'packages/shared/**/*.ts'],
    extends: [...tseslint.configs.recommended],
  },
);
