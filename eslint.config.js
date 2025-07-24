// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';
import stylistic from '@stylistic/eslint-plugin';
import vue from 'eslint-plugin-vue';
import prettierPlugin from 'eslint-plugin-prettier';
import path from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import prettierConfig from 'eslint-config-prettier';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const compat = new FlatCompat({
  baseDirectory: dirname,
});

const extendsConfig = (name) => compat.extends(name);

export const airbnbConfig = extendsConfig(`airbnb`);
export const airbnbHooksConfig = extendsConfig(`airbnb/hooks`);
export const airbnbTypescriptConfig = extendsConfig(`airbnb-typescript`);

// deprecated ESLint formatting rules
const deprecatedFormattingRules = [
  `array-bracket-newline`,
  `array-bracket-spacing`,
  `array-element-newline`,
  `arrow-spacing`,
  `block-spacing`,
  `brace-style`,
  `comma-dangle`,
  `comma-spacing`,
  `comma-style`,
  `computed-property-spacing`,
  `eol-last`,
  `func-call-spacing`,
  `function-call-argument-newline`,
  `function-paren-newline`,
  `implicit-arrow-linebreak`,
  `indent`,
  `key-spacing`,
  `keyword-spacing`,
  `linebreak-style`,
  `lines-between-class-members`,
  `multiline-ternary`,
  `newline-per-chained-call`,
  `no-extra-parens`,
  `no-extra-semi`,
  `no-mixed-spaces-and-tabs`,
  `no-multi-spaces`,
  `no-multiple-empty-lines`,
  `no-tabs`,
  `no-trailing-spaces`,
  `object-curly-newline`,
  `object-curly-spacing`,
  `object-property-newline`,
  `operator-linebreak`,
  `padded-blocks`,
  `quote-props`,
  `quotes`,
  `rest-spread-spacing`,
  `semi`,
  `semi-spacing`,
  `semi-style`,
  `space-before-blocks`,
  `space-before-function-paren`,
  `space-in-parens`,
  `space-infix-ops`,
  `space-unary-ops`,
  `switch-colon-spacing`,
  `template-curly-spacing`,
  `template-tag-spacing`,
  `wrap-iife`,
  `wrap-regex`,
  `yield-star-spacing`,
];

const deprecatedRuleMapper = {
  '@typescript-eslint/no-throw-literal': `@typescript-eslint/only-throw-error`,
};

const fixDeprecatedRules = (configs) =>
  configs.map((config) => {
    if (!config.rules) return config;

    const resultRules = Object.fromEntries(
      Object.entries(config.rules).map(([rule, ruleConfig]) => {
        if (rule in deprecatedRuleMapper) {
          return [deprecatedRuleMapper[rule], ruleConfig];
        }

        const ruleFixedName = rule.replace(/^@typescript-eslint\//, ``);
        if (deprecatedFormattingRules.includes(ruleFixedName)) {
          return [`@stylistic/${ruleFixedName}`, ruleConfig];
        }

        return [rule, ruleConfig];
      }),
    );

    return {
      ...config,
      rules: resultRules,
    };
  });

const config = tseslint.config(
  ...airbnbConfig,
  ...airbnbHooksConfig,
  ...airbnbTypescriptConfig,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierConfig,

  // JS/TS files
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      '@stylistic': stylistic,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Vue 3 support
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: await vue.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue,
      prettier: prettierPlugin,
    },
    rules: {
      ...vue.configs['vue3-recommended'].rules,
      'prettier/prettier': 'error',
    },
  },

  // Disable type-check rules on plain JS
  {
    files: ['**/*.js', '**/*.jsx'],
    ...tseslint.configs.disableTypeChecked,
  },
);

export default fixDeprecatedRules(config);
