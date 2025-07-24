module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue',
  ],
  plugins: ['stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
  },
};