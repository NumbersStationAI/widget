import path from 'path'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const port = Number(env.PORT)

  return {
    base: '',
    define: {
      __API_URL__: JSON.stringify(
        env.API_URL ?? 'https://api.numbersstation.ai',
      ),
      __APP_URL__: JSON.stringify(
        env.APP_URL ?? 'https://app.numbersstation.ai',
      ),
    },
    resolve: {
      alias: {
        '@ns/api-client': path.resolve(__dirname, './src/client.ts'),
        '@ns/public-api': path.resolve(
          __dirname,
          '../../packages/public-api/kubb/index.ts',
        ),
      },
    },
    build: {
      outDir: 'build',
    },
    server: {
      port: Number.isNaN(port) ? 5173 : port,
      allowedHosts: ['arctic', 'atlantic', 'pacific', 'southern'],
    },
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tsconfigPaths(),
      svgr({ svgrOptions: { exportType: 'named' } }),
    ],
  }
})
