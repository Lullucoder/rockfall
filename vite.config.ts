import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use import.meta.env (Vite) and fallback list
function getAllowedHosts(): string[] {
  // Vite exposes env through import.meta.env at build time
  const metaEnv = (import.meta as any).env || {};
  const base = metaEnv.VITE_ALLOWED_HOSTS || '.loca.lt,localhost,0.0.0.0';
  return String(base).split(',').map((h: string) => h.trim()).filter(Boolean);
}
const allowed = getAllowedHosts();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // listen on 0.0.0.0
    port: 5173,
    allowedHosts: [
      ...allowed,
      'upset-pots-begin.loca.lt' // current tunnel subdomain
    ]
  }
});
