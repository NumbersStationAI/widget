import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'

export default defineConfig({
  root: '.',
  input: {
    path: './openapi.json',
  },
  output: {
    path: './kubb',
    extension: { '.ts': '', '.tsx': '', '.js': '', '.json': '.json' },
  },
  plugins: [
    pluginOas(),
    pluginTs({
      enumType: 'enum',
      enumSuffix: '',
      unknownType: 'unknown',
    }),
    pluginZod({
      unknownType: 'unknown',
      output: { path: 'zod', banner: '// @ts-nocheck' },
    }),
    pluginClient({
      importPath: '@ns/api-client',
      paramsType: 'object',
      paramsCasing: 'camelcase',
    }),
    pluginReactQuery({
      paramsType: 'object',
      paramsCasing: 'camelcase',
      client: {
        importPath: '@ns/api-client',
      },
      mutation: {
        importPath: '@ns/api-client',
      },
      output: { path: 'hooks', banner: '// @ts-nocheck' },
      suspense: false,
    }),
  ],
})
