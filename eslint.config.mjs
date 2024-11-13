import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends('plugin:vue/vue3-essential', 'eslint:recommended'),
  {
    languageOptions: {
      globals: {
        'Cesium': true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'prefer-const ': [0, {
        ignoreReadBeforeAssign: false,
      }],

      'no-unused-vars': [1, {
        vars: 'all',
        args: 'after-used',
      }],

      quotes: [1, 'single'],
      'no-console': 'off',
      'no-debugger': 1,
      semi: [2, 'always'],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'no-irregular-whitespace': 2,
      'no-mixed-spaces-and-tabs': [2, false],
      indent: ['error', 2],

      'key-spacing': [1, {
        beforeColon: false,
        afterColon: true,
      }],

      'vue/multi-word-component-names': 'off',

      'comma-spacing': ['warn', {
        after: true,
      }],

      'space-before-function-paren': 0,
      camelcase: 0,
      eqeqeq: 0,
      'import/first': 0,
      'vue/no-reserved-keys': 0,
      'no-case-declarations': 0,
      'no-new': 0,
      'no-eval': 0,
      'no-proto': 0,
      'prefer-promise-reject-errors': 0,
    },
  }];