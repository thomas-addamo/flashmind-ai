import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPOSTAZIONE CRUCIALE PER GITHUB PAGES
  // Deve corrispondere al nome del tuo repository: /nome-repo/
  base: '/flashmind-ai/',
  build: {
    target: 'esnext'
  }
});