import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Keep this list in sync with COURSE_MODES in src/config/courseMode.js.
const COURSE_MODES = ['acls', 'bls', 'airway', 'defib', 'iv']
const mode = COURSE_MODES.includes(process.env.VITE_COURSE_MODE)
  ? process.env.VITE_COURSE_MODE
  : 'acls'

const MANIFESTS = {
  acls: {
    name: 'ACLS EMR',
    short_name: 'ACLS',
    description: 'Advanced Cardiac Life Support Recording System',
    theme_color: '#DC2626',
    id: '/acls',
    icon: '/icon.svg',
  },
  bls: {
    name: 'BLS for Healthcare Providers',
    short_name: 'BLS',
    description: 'การช่วยชีวิตขั้นพื้นฐานสำหรับบุคลากรทางการแพทย์ (BLS ตาม ILCOR 2025)',
    theme_color: '#0EA5E9',
    id: '/bls-hcp',
    icon: '/icon-bls.svg',
  },
  airway: {
    name: 'Airway Management',
    short_name: 'Airway',
    description: 'หลักสูตรการจัดการทางเดินหายใจ (ตาม ILCOR 2025)',
    theme_color: '#059669',
    id: '/airway-skills',
    icon: '/icon-airway.svg',
  },
  defib: {
    name: 'Defibrillation & Electrical Therapy',
    short_name: 'Defib',
    description: 'หลักสูตรการช็อกไฟฟ้าหัวใจ (ตาม ILCOR 2025)',
    theme_color: '#D97706',
    id: '/defib-skills',
    icon: '/icon-defib.svg',
  },
  iv: {
    name: 'IV / IO Access & Drug Delivery',
    short_name: 'IV/IO',
    description: 'หลักสูตรการเปิดเส้นและให้ยา IV/IO ในภาวะวิกฤต (ตาม ILCOR 2025)',
    theme_color: '#7C3AED',
    id: '/iv-io-skills',
    icon: '/icon-iv.svg',
  },
}

const m = MANIFESTS[mode]
const manifest = {
  name: m.name,
  short_name: m.short_name,
  description: m.description,
  theme_color: m.theme_color,
  background_color: '#F1F5F9',
  display: 'standalone',
  orientation: 'any',
  start_url: '/',
  id: m.id,
  icons: [
    { src: m.icon, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
  ],
}

export default defineConfig({
  resolve: {
    alias: {
      // Points at the scenario pack for the course being built, so a single-course
      // build's module graph never even sees the other courses' Code Blue Sim
      // scenario files (a `COURSE_MODE ? x : y` runtime filter can't stop Rollup
      // from bundling every branch — this alias makes the unused branches
      // unreachable at the module-resolution level instead).
      '@scenario-pack': path.resolve(__dirname, `src/data/scenarioPacks/${mode}.js`),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['favicon.svg', m.icon.replace(/^\//, '')],
      manifest,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    })
  ],
})
