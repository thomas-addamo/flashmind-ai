import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente (es. VITE_GEMINI_API_KEY) dal file .env o dai Secrets di GitHub
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // IMPOSTAZIONE CRUCIALE PER GITHUB PAGES
    // Deve corrispondere al nome del tuo repository: /nome-repo/
    base: '/flashmind-ai/',
    
    define: {
      // Questo permette di usare process.env.API_KEY nel codice frontend (geminiService.ts)
      // Vite lo sostituirà con il valore reale durante la build.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    }
  };
});