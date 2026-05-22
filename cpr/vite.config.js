import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'เรียน CPR + AED ฟรี | morroo',
        short_name: 'CPR Learn',
        description: 'เรียน CPR และวิธีใช้ AED ฟรี ใน 15 นาที สำหรับทุกคน',
        theme_color: '#DC2626',
        background_color: '#FEF2F2',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        lang: 'th',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
});
