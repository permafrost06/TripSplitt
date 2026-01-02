import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import wasm from 'vite-plugin-wasm';

// https://vite.dev/config/
export default defineConfig({
    server: {
        https: {
            key: await import('fs').then((fs) => fs.readFileSync('/tmp/key.pem')),
            cert: await import('fs').then((fs) => fs.readFileSync('/tmp/cert.pem')),
        },
        host: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    optimizeDeps: {
        exclude: ['brotli-wasm'],
    },
    plugins: [
        wasm(),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.svg', 'apple-touch-icon.svg', '**/*.wasm'],
            manifest: {
                name: 'TripSplitt',
                short_name: 'TripSplitt',
                description: 'Split expenses among a group of people during trips or events',
                theme_color: '#3b82f6',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                    },
                    {
                        src: 'pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                    },
                    {
                        src: 'pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\./,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24, // 24 hours
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
});
