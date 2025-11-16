import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  base: '/coliana/',
  build: {
    assets: 'astro'
  }
  ,
  vite: {
    server: {
      allowedHosts: ['laptop.arsenum.com'],
    },
  }
});