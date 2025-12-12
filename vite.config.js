import { defineConfig } from 'vite';
import path from 'path'; // 1. IMPORTAR o módulo 'path'

// Função auxiliar para resolver caminhos absolutos
const resolve = (p) => path.resolve(__dirname, p);

export default defineConfig({
  root: 'public',
  resolve: {
    alias: {
      '/src': resolve('src'),
      '@': resolve('src')
    }
  },
  server: {
    fs: {
      strict: false,
      allow: [resolve('public'), resolve('src'), __dirname]
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve('public/index.html'),
        eventos: resolve('public/eventos.html'),
        parceiros: resolve('public/parceiros.html')
      }
    }
  }
});
