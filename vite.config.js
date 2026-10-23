import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({ base: './', plugins: [vue()], server: { port: 4173, strictPort: true }, build: { chunkSizeWarningLimit: 800 } });
