import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev: /api -> backend .NET (porta definida no launchSettings / README do backend)
      '/api': { target: 'http://localhost:5177', changeOrigin: true },
    },
  },
});
