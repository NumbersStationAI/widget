const resolveExtensions = ['.js', '.jsx', '.ts', '.tsx']

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'promise'],
  parserOptions: { project: true },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:valtio/recommended',
    'plugin:promise/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    node: true,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': resolveExtensions,
    },
    // Support Typescript's `paths` aliases (e.g. `~/` to `./app/`).
    // @see {@link https://stackoverflow.com/a/57678771}
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    // Updating rules which are part of the recommended sets
    // to warnings instead of errors (without changing any of
    // the default configurations). This gives us more flexibility
    // since we can still make our CI/CD pipeline fail with --max-warnings=0
    // while still allowing us to use the `--fix` flag in a precommit hook
    // and not blocking commits if there are any warnings.

    // START ------ UPDATING RECOMMENDED RULES ------------

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

    // END -------- UPDATING RECOMMENDED RULES -----------

    // only allow === except int he case of nulls.
    // `myVar != null` is less code to write to check
    // for both undefined and null while still being safe
    // https://eslint.org/docs/latest/rules/eqeqeq
    'eqeqeq': ['warn', 'always', { null: 'ignore' }],

    // Allow using functions before they are defined. This lets us better
    // organize component definitions so the main API is at the top and smaller
    // components are defined in sections below.
    // @see {@link https://eslint.org/docs/rules/no-use-before-define}
    // @see {@link https://typescript-eslint.io/rules/no-use-before-define}
    // @example {@link https://github.com/pacocoursey/cmdk/blob/main/website/pages/index.tsx}
    '@typescript-eslint/no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: true,
        variables: false,
      },
    ],

    // Do not allow explicitly setting any value to any. We're trying to remove as many "any's" as possible from the codebase
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-explicit-any.md}
    '@typescript-eslint/no-explicit-any': 'warn',

    // Try to keep component files small and focused, but allow for
    // small components to be defined in the same file if they're
    // purpose is to simplify the main component's UI
    // @see {@link https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-multi-comp.md}
    'react/no-multi-comp': ['warn', { ignoreStateless: true }],

    // Allow importing dev dependencies in the tests directory.
    // @see {@link https://github.com/import-js/eslint-plugin-import/blob/HEAD/docs/rules/no-extraneous-dependencies.md}
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
          '**/vite.config.js',
          '**/vite.config.ts',
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

    // Allow namespace usage (in general, not recommended, but we are already
    // using it pretty much everywhere, so we'll allow it with a warning).
    // @see {@link https://typescript-eslint.io/rules/no-namespace}
    '@typescript-eslint/no-namespace': ['warn'],

    // Support Typescript's triple slash directive comments in reference files.
    // Also allow comment dividers that consist of just `////////////////////`.
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/issues/600}
    // @see {@link https://eslint.org/docs/latest/rules/spaced-comment}
    // @example {@link https://github.com/pacocoursey/cmdk/blob/main/website/pages/index.tsx}
    'spaced-comment': [
      'warn',
      'always',
      {
        exceptions: ['/'],
        markers: ['/'],
      },
    ],

    // Use `void` operator to deal with dangling promises.
    // @see {@link https://eslint.org/docs/rules/no-void}
    // @example
    // public componentDidUpdate(): void {
    //   void someAsyncSideEffectFunction();
    // }
    //
    // private async someAsyncSideEffectFunction(): Promise<void> {
    //   ...do async side effect stuff
    // }
    'no-void': ['warn', { allowAsStatement: true }],

    // Disallow multiple empty lines, only one newline at the end, and no new
    // lines at the beginning.
    // @see {@link https://eslint.org/docs/rules/no-multiple-empty-lines}
    'no-multiple-empty-lines': ['warn', { max: 1, maxBOF: 0, maxEOF: 0 }],

    // Disallow unused variables (variables that are declared and not used
    // anywhere in our code).
    // @see {@link https://eslint.org/docs/rules/no-unused-vars}
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md}
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

    // Bind methods in constructor (don't use arrow functions as class fields).
    // @see {@link https://github.com/airbnb/javascript/tree/master/react#methods}
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/issues/636}
    '@typescript-eslint/unbound-method': 'warn',

    // Specify inferable types for function parameters. Otherwise, we get type
    // errors when trying to do something like this:
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-inferrable-types.md}
    // @example
    // async function search(query: string = '') {
    //   const { users } = await new Query({ query }).search();
    //   return users.map(userToOption);
    // }
    '@typescript-eslint/no-inferrable-types': [
      'warn',
      { ignoreParameters: true },
    ],

    // Reset to the default static property placement (so all class static field
    // declarations remain inside of the class).
    // @todo Perhaps we want to use the AirBNB recommended styling.
    // @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/static-property-placement.md}
    // @see {@link https://github.com/airbnb/javascript/tree/master/react#ordering}
    'react/static-property-placement': ['warn', 'static public field'],

    // I use index keys when rendering fallback loading screens where:
    // 1. the list and items are static–they are not computed and do not change;
    // 2. the items in the list have no ids;
    // 3. the list is never reordered or filtered.
    // @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md}
    // @see {@link https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318}
    'react/no-array-index-key': 'warn',

    // Configure `jsx-a11y` to recognize RMWC input components as controls.
    // @see {@link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/label-has-associated-control.md#case-my-label-and-input-components-are-custom-components}
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        controlComponents: ['Checkbox', 'TextField', 'Select'],
      },
    ],

    // We don't want to have to manually define extensions for js(x)/ts(x) files.
    // We'll still need to manually type them for json/css and such.
    // This combined with import/resolver extensions defintion above makes it so that
    // we don't get eslint errors when we don't specify those extensions.
    // @see {@link https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/extensions.md}
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

    // When an import is only used for a TS type, then it should specify
    // that within the import statement.
    // @see {@link https://typescript-eslint.io/rules/consistent-type-imports}
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'inline-type-imports',
      },
    ],

    // Consistently use the inline type import syntax.
    // @see {@link https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/consistent-type-specifier-style.md}
    'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],

    // Expect `<a>` tags to not have `href` attributes when wrapped with the
    // Next.js `<Link>` component.
    // @see {@link https://git.io/Jns2B}
    'jsx-a11y/anchor-is-valid': 'warn',

    // Adjust exhaustive-deps to include some of our own custom hooks.
    // @see {@link https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks#advanced-configuration}
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '(useRunOnce|useWindowListener|useTablePaginator)',
      },
    ],

    // Split imports by type. This adds a newline between each import group
    // (e.g. built-ins, externals, internals). Those import groups are also
    // sorted alphabetically by pathname
    // @see {@link https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md}
    'import/order': [
      'warn',
      {
        'alphabetize': {
          order: 'asc',
          orderImportKind: 'asc',
          caseInsensitive: true,
        },
        'named': true,
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
            pattern: '~/routes/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '~/api',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@ns/**',
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

    // Rules to ignore:

    // This rule conflicts with @typescript-eslint/no-namespace
    '@typescript-eslint/prefer-namespace-keyword': 'off',

    // Remix requires specific named exports for route files (e.g. loader).
    // @see {@link https://remix.run/docs/en/v1/api/conventions#loader}
    // @see {@link https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/prefer-default-export.md}
    'import/prefer-default-export': 'off',

    // Next.js already imports React globally and handles JSX for us.
    // @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md}
    'react/react-in-jsx-scope': 'off',

    // I use TypeScript default object property syntax instead of React's
    // `defaultProps` functionality (to reduce code complexity).
    // @see {@link https://git.io/JnsaY}
    'react/require-default-props': 'off',

    // Remix encourages throwing response literals in loader functions.
    // @see {@link https://remix.run/docs/en/v1/guides/not-found#how-to-send-a-404}
    // @see {@link https://typescript-eslint.io/rules/no-throw-literal}
    '@typescript-eslint/no-throw-literal': 'off',

    // Spreading props is a useful tool when used correctly.  I don't think this should be disabled
    // @see {@link https://github.com/airbnb/javascript/tree/master/react#props}
    // @see {@link https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md}
    'react/jsx-props-no-spreading': 'off',

    // This rule seems unnecessary since we don't always want to return a value from an arrow function.
    // @see {@link https://github.com/rauchg/eslint-es6/blob/master/docs/rules/consistent-return.md}
    'consistent-return': 'off',

    // This rule is not necessary since we already use TS and don't allow anys
    // @see {@link https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md}
    'react/prop-types': 'off',

    // We're not sloppy devs who use five ternaries inside each other.
    // Sometimes a nested ternary is just better. Use your best judgement.
    // @see {@link https://eslint.org/docs/latest/rules/no-nested-ternary}
    'no-nested-ternary': 'off',

    // These rules from the `unsafe` family are more likely to be annoying than
    // helpful since we use TS, don't allow anys, and we use @total-typescript/ts-reset

    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unsafe-argument.md}
    '@typescript-eslint/no-unsafe-argument': 'off',
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unsafe-assignment.md}
    '@typescript-eslint/no-unsafe-assignment': 'off',
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unsafe-member-access.md}
    '@typescript-eslint/no-unsafe-member-access': 'off',
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unsafe-return.md}
    '@typescript-eslint/no-unsafe-return': 'off',
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unsafe-call.md}
    '@typescript-eslint/no-unsafe-call': 'off',

    // In my experience, when using a variable within a template string
    // it's usually intentional, and it will call toString() on the value
    // if it is something like a number. It's normally obvious if you're
    // using a value you shouldn't be.
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/restrict-template-expressions.md}
    '@typescript-eslint/restrict-template-expressions': 'off',

    // Since openApi generates types for us from python, we can't control
    // those names.  Otherwise our code reviews should suffice.
    // @see ${@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md}
    '@typescript-eslint/naming-convention': 'off',

    // This rule seems unnecessary. Sometimes you want to call a promise
    // and not do anything with it or await it. AKA, a fire and forget.
    // @see (@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.md)
    '@typescript-eslint/no-floating-promises': 'off',

    // Same logic as the rule above -- unnecessary.
    // @see ${@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/require-await.md}
    // @see ${@link https://eslint.org/docs/latest/rules/require-await}
    '@typescript-eslint/require-await': 'off',

    // All this rule does is force you to type more characters
    // in the case where you would use it.  For example:
    //  ```ts
    //    type MyType = SomeObjType1 | SomeObjType2 | null;
    //    // already did a check elsewhere, so I know this can only
    //    // be SomeObjType1 | SomeObjType2. Instead of doing:
    //    myFunction(myVar as SomeObjType1 | SomeObjType2) or
    //    myFunction(myVar as NonNullable<myType>)
    //    we can instead do:
    //    myFunction(myVar!)
    //  ```
    // This should NOT be abused, though. Only use it in the cases
    // where you would have cast the type anyway
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-non-null-assertion.md}
    '@typescript-eslint/no-non-null-assertion': 'off',

    // This rule requires that you name the parameters to a promise
    // resolve/rejecct function `resolve` and `reject` with a possible leaving
    // underscore. No other value is acceptable. I fine this overly strict
    // @see {@link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/param-names.md}
    'promise/param-names': 'off',

    // unnecessary descrimination again built-in JS keywords and operators!

    // The only possible issue I can see with ++ is making readability
    // a bit harder when you put it within another statement,
    // since (while (i++)) and (while (++i)) behvae differently, for example.
    // This is something that should be part of a code review. Just don't do that.
    // The other issue listed in the docs is problems with automatic semicolon
    // insertion, but we have prettier for that.
    // @see {@link https://eslint.org/docs/latest/rules/no-plusplus}
    'no-plusplus': 'off',

    // I don't see a problem with continue. It's not used all that
    // often, but when it is, it makes life easier since it is hard
    // to achieve the same behavior without it or within array iterator methods.
    // @see {@link https://eslint.org/docs/latest/rules/no-continue}
    'no-continue': 'off',

    // This rule complains when you provide a function which returns a promise
    // to something which doesn't expect it. For example, if we have a click event
    // on a button, and an application-wide function which can be called directly
    // from the onClick, but it returns a promise, the onClick will complain.
    // I feel that this is unnecessarily strict, and just causes more boilerplate
    // @see {@link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-misused-promises.md}
    '@typescript-eslint/no-misused-promises': 'off',

    // This rule is inconvenient and unnecessary
    // @see {@link https://eslint.org/docs/latest/rules/no-param-reassign}
    'no-param-reassign': 'off',

    // These rules are inconvenient and unnecessary. Almost any time I'm not using
    // async/await, I don't care if I return/catch (for example dynamic imports).
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'promise/no-nesting': 'off',

    // I have disabled this rule every time I use it because it isn't
    // a useless fragment in those cases.  I think code-review is
    // enough for this rule.
    'react/jsx-no-useless-fragment': 'off',

    // This rule isn't necessary. Creating an interface and classes which
    // implement that interface for polymorphism reasons is used for
    // auth clients, and we don't need to use `this` just because it's a class
    'class-methods-use-this': 'off',
  },
  overrides: [
    {
      files: ['playwright/**/*.ts', 'playwright.config.ts'],
      rules: {
        'no-console': 'off',
        // For playwright, it's a very common issue to forget to await a promise causing
        // flakiness in tests. This rule can help catch those issues in PW tests.
        // If you want to explicitly call a promise without doing anything to handle it,
        // just add `void` in front of the promise call.
        '@typescript-eslint/no-floating-promises': [
          'warn',
          { ignoreVoid: true },
        ],
      },
    },
  ],
  reportUnusedDisableDirectives: true,
}
