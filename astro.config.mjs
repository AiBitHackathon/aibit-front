// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import path from "path";
import { fileURLToPath } from "url";
import react from "@astrojs/react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: "static",
  site: "https://aibit-front-ic06d.sevalla.com", // Replace with your actual Sevalla domain
  base: "/",
  server: {
    port: 8888,
    host: true,
    https: {
      cert: path.resolve(__dirname, "../certs/localhost.pem"),
      key: path.resolve(__dirname, "../certs/localhost-key.pem"),
    },
  },
  vite: {
    server: {
      https: {
        cert: path.resolve(__dirname, "../certs/localhost.pem"),
        key: path.resolve(__dirname, "../certs/localhost-key.pem"),
      },
      // Force HTTPS and redirect HTTP to HTTPS
      strictPort: true,
    },
  },
  // Add security headers
  headers: {
    "Content-Security-Policy": {
      value:
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    },
  },
});
