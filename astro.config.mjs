import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kazookat.dev',
  trailingSlash: 'never',
  build: { format: 'file' },
});
