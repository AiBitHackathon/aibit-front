// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from "@astrojs/node";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 8888,
    host: true,
    https: {
      cert: path.resolve(__dirname, '../certs/localhost.pem'),
      key: path.resolve(__dirname, '../certs/localhost-key.pem'),
    },
  },
  vite: {
    server: {
      https: {
        cert: path.resolve(__dirname, '../certs/localhost.pem'),
        key: path.resolve(__dirname, '../certs/localhost-key.pem'),
      },
      // Force HTTPS and redirect HTTP to HTTPS
      strictPort: true,
    },
  },
  // Add security headers
  headers: {
    'Content-Security-Policy': {
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    }
  }
});
