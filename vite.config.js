import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const isProduction = process.env.NODE_ENV === 'production'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const commitHash = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
})()

const interactjsKeepSideEffects = () => ({
  name: 'interactjs-keep-side-effects',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
    if (!resolved) return null
    const id = typeof resolved === 'string' ? resolved : resolved.id
    if (id.includes('@interactjs/')) {
      if (typeof resolved === 'string') return { id: resolved, moduleSideEffects: true }
      resolved.moduleSideEffects = true
    }
    return resolved
  },
})

export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.APP_COMMIT': JSON.stringify(commitHash),
  },
  base: '',
  plugins: [
    interactjsKeepSideEffects(),
    vue(),
    isProduction && VitePWA({
      registerType: 'autoUpdate',
      filename: 'service-worker.js',
      includeAssets: ['favicon.svg', 'img/**/*', 'sounds/**/*'],
      manifest: {
        name: 'Vương Quốc Cầu Vồng',
        short_name: 'Cầu Vồng',
        description: 'Học toán, tiếng Anh và sáng tạo cho bé',
        theme_color: '#37373e',
        background_color: '#37373e',
        display: 'standalone',
        // relative, so the game also works inside a folder of a website (www.leocuong.com/rainbow/)
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        // pictures (webp, jpg) stay on the tablet too, so the game works without Wi-Fi
        globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,mp3,woff2}'],
        // the voice without a name is only needed by children other than Mia: kept once heard
        globIgnores: ['**/sounds/*/kid/**'],
        runtimeCaching: [
          {
            urlPattern: /\/sounds\/(en|vi)\/kid\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: { cacheName: 'voice-kid', expiration: { maxEntries: 1500 } },
          },
        ],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'mitt'],
          interact: ['@interactjs/interact', '@interactjs/interactjs']
        }
      }
    }
  },
  server: {
    port: 8080,
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/main.js', 'src/registerServiceWorker.js', '**/*.config.*']
    },
    setupFiles: ['tests/setup.js']
  }
})