// eslint.config.js — корневой конфиг ESLint (flat config, ESLint 9).
// Каждый воркспейс подключает собственные плагины (next, nest) по мере необходимости.
module.exports = {
  ignores: ['node_modules', 'dist', 'build', '.next', 'out', 'coverage', 'pgdata'],
};
