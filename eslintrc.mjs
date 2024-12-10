import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import promise from 'eslint-plugin-promise'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  {
    ignores: [],
  },
  ...fixupConfigRules(
    compat.extends(
      'react-app',
      'airbnb',
      'airbnb-typescript',
      'airbnb/hooks',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:valtio/recommended',
      'plugin:promise/recommended',
      'plugin:prettier/recommended',
    ),
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      'promise': fixupPluginRules(promise),
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'commonjs',

      parserOptions: {
        project: [
          '/home/ahsan/dev/ns-embeddable/widget/tsconfig.app.json',
          '/home/ahsan/dev/ns-embeddable/widget/playwright/tsconfig.json',
        ],
      },
    },

    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
      },

      'import/resolver': {
        typescript: {
          project: [
            '/home/ahsan/dev/ns-embeddable/widget/tsconfig.app.json',
            '/home/ahsan/dev/ns-embeddable/widget/playwright/tsconfig.json',
          ],

          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      'default-case': 'warn',
      '@typescript-eslint/ban-types': 'warn',
      'no-promise-executor-return': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-shadow': 'warn',
      'react/no-unescaped-entities': 'warn',
      'prettier/prettier': 'warn',
      'object-shorthand': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'no-restricted-syntax': 'warn',
      'no-restricted-globals': 'warn',
      'default-case-last': 'warn',
      'no-await-in-loop': 'warn',
      'prefer-destructuring': 'warn',
      'react/destructuring-assignment': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      'no-underscore-dangle': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'no-return-assign': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/no-loop-func': 'warn',
      'guard-for-in': 'warn',
      'no-cond-assign': 'warn',
      'no-bitwise': 'warn',
      'import/export': 'warn',
      '@typescript-eslint/no-redeclare': 'warn',
      'react/jsx-no-constructed-context-values': 'warn',
      'react/no-unstable-nested-components': 'warn',
      'react/no-unused-prop-types': 'warn',
      'array-callback-return': 'warn',
      'no-console': ['error', { allow: ['error'] }],

      'eqeqeq': [
        'warn',
        'always',
        {
          null: 'ignore',
        },
      ],

      '@typescript-eslint/no-use-before-define': [
        'warn',
        {
          functions: false,
          classes: true,
          variables: false,
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',

      'react/no-multi-comp': [
        'warn',
        {
          ignoreStateless: true,
        },
      ],

      'import/no-extraneous-dependencies': [
        'warn',
        {
          devDependencies: [
            'playwright/**',
            'playwright.config.ts',
            '**/*{.,_}{test,spec}.{js,jsx}',
            '**/*{.,_}{test,spec}.{ts,tsx}',
            '**/jest.config.js',
            '**/jest.config.ts',
            '**/jest.setup.js',
            '**/jest.setup.ts',
            '**/vue.config.js',
            '**/vue.config.ts',
            '**/webpack.config.js',
            '**/webpack.config.ts',
            '**/webpack.config.*.js',
            '**/webpack.config.*.ts',
            '**/rollup.config.js',
            '**/rollup.config.ts',
            '**/rollup.config.*.js',
            '**/rollup.config.*.ts',
            '**/gulpfile.js',
            '**/gulpfile.ts',
            '**/gulpfile.*.js',
            '**/gulpfile.*.ts',
            '**/Gruntfile{,.js}',
            '**/Gruntfile{,.ts}',
            '**/protractor.conf.js',
            '**/protractor.conf.ts',
            '**/protractor.conf.*.js',
            '**/protractor.conf.*.ts',
            '**/karma.conf.js',
            '**/karma.conf.ts',
            '**/.eslintrc.js',
            '**/.eslintrc.ts',
          ],

          optionalDependencies: false,
        },
      ],

      '@typescript-eslint/no-namespace': ['warn'],

      'spaced-comment': [
        'warn',
        'always',
        {
          exceptions: ['/'],
          markers: ['/'],
        },
      ],

      'no-void': [
        'warn',
        {
          allowAsStatement: true,
        },
      ],

      'no-multiple-empty-lines': [
        'warn',
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 0,
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/unbound-method': 'warn',

      '@typescript-eslint/no-inferrable-types': [
        'warn',
        {
          ignoreParameters: true,
        },
      ],

      'react/static-property-placement': ['warn', 'static public field'],
      'react/no-array-index-key': 'warn',

      'jsx-a11y/label-has-associated-control': [
        'warn',
        {
          controlComponents: ['Checkbox', 'TextField', 'Select'],
        },
      ],

      'import/extensions': [
        'warn',
        'ignorePackages',
        {
          '': 'never',
          'js': 'never',
          'jsx': 'never',
          'ts': 'never',
          'tsx': 'never',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],

      'jsx-a11y/anchor-is-valid': 'warn',

      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useRunOnce|useWindowListener|useTablePaginator)',
        },
      ],

      'import/order': [
        'warn',
        {
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },

          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],

          'pathGroups': [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/icons/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/ui/icons/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/ui/atoms/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/ui/molecules/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/components/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/routes/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/api/models/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/libs/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/styles/**',
              group: 'internal',
              position: 'before',
            },
          ],

          'pathGroupsExcludedImportTypes': ['builtin'],
          'newlines-between': 'always',
        },
      ],

      '@typescript-eslint/prefer-namespace-keyword': 'off',
      'import/prefer-default-export': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      '@typescript-eslint/no-throw-literal': 'off',
      'react/jsx-props-no-spreading': 'off',
      'consistent-return': 'off',
      'react/prop-types': 'off',
      'no-nested-ternary': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'promise/param-names': 'off',
      'no-plusplus': 'off',
      'no-continue': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      'no-param-reassign': 'off',
      'promise/catch-or-return': 'off',
      'promise/always-return': 'off',
      'promise/no-nesting': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'class-methods-use-this': 'off',
    },
  },
  {
    files: ['playwright/**/*.ts', '**/playwright.config.ts'],

    rules: {
      '@typescript-eslint/no-floating-promises': [
        'warn',
        {
          ignoreVoid: true,
        },
      ],
    },
  },
]
