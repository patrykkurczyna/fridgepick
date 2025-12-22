// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";

const isCloudflare = process.env.CF_PAGES === "1";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: isCloudflare
    ? cloudflare({
        platformProxy: {
          enabled: true,
        },
      })
    : node({
        mode: "standalone",
      }),
});
