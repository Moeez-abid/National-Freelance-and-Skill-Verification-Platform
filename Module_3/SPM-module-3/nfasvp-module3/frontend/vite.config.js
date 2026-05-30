import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:4003'

  return {
    plugins: [react()],
    server: {
      port: 5003,
      proxy: {
        // Forward all /api/v1/* calls to the Express backend
        '/api/v1': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
