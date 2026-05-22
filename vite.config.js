import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const isBLS = process.env.VITE_COURSE_MODE === 'bls'

const manifest = isBLS
  ? {
      name: 'BLS for Healthcare Providers',
      short_name: 'BLS',
      description: 'การช่วยชีวิตขั้นพื้นฐานสำหรับบุคลากรทางการแพทย์ (BLS ตาม ILCOR 2025)',
      theme_color: '#0EA5E9',
      background_color: '#F1F5F9',
      display: 'standalone',
      orientation: 'any',
      start_url: '/',
      id: '/bls-hcp',
      icons: [
        { src: '/icon-bls.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
      ],
    }
  : {
      name: 'ACLS EMR',
      short_name: 'ACLS',
      description: 'Advanced Cardiac Life Support Recording System',
      theme_color: '#DC2626',
      background_color: '#F1F5F9',
      display: 'standalone',
      orientation: 'any',
      start_url: '/',
      id: '/acls',
      icons: [
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
      ],
    }

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: isBLS
        ? ['favicon.svg', 'icon-bls.svg']
        : ['favicon.svg', 'icon.svg'],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })
  ],
})
