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

// Every build has its own id; the app compares it with version.json on the server and
// updates itself when they differ (23/11/2026: updates were stuck behind the offline cache).
const BUILD_ID = commitHash + '-' + Date.now().toString(36)
const versionFile = () => ({
  name: 'version-file',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD_ID }) })
  },
})

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
    'import.meta.env.APP_BUILD': JSON.stringify(BUILD_ID),
  },
  base: '',
  plugins: [
    interactjsKeepSideEffects(),
    vue(),
    versionFile(),
    isProduction && VitePWA({
      registerType: 'autoUpdate',
      filename: 'service-worker.js',
      includeAssets: ['favicon.svg'],
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
        // Web only (23/11/2026): just the app itself is cached up front, so a new version installs in seconds.
        // Pictures and sounds are kept once seen or heard.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        globIgnores: ['**/version.json'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\/version\.json$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\.(?:mp3|m4a)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'sounds', expiration: { maxEntries: 8000 } },
          },
          {
            urlPattern: /\.(?:webp|png|jpg|jpeg)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'pictures', expiration: { maxEntries: 3000 } },
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