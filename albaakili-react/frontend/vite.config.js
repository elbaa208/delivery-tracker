import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.cookie) proxyReq.setHeader('cookie', req.headers.cookie)
          })
        }
      },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true }
    }
  }
})
