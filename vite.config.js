import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/R34/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rule34.xxx',
        changeOrigin: true,
        secure: false,
        // Strip the /api prefix so /api/index.php → /index.php on the target
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          // Inject browser-like headers so Cloudflare doesn't block the request
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Referer', 'https://rule34.xxx/')
            proxyReq.setHeader('Origin', 'https://rule34.xxx')
            proxyReq.setHeader(
              'User-Agent',
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            )
            // Remove headers that can trigger CORS preflight on the target
            proxyReq.removeHeader('origin')
          })
          proxy.on('error', (err, _req, res) => {
            console.error('[proxy]', err.message)
            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'proxy_error', message: err.message }))
          })
        }
      }
    }
  }
})
