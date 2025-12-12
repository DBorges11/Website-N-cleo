import { defineConfig } from 'vite';
import path from 'path';

const resolve = (p) => path.resolve(__dirname, p);

export default defineConfig({
    // 1. Corrige o caminho base para compatibilidade Vercel/caminhos relativos
    base: './', 

    // 2. Remove o 'root' (ou comenta-o) para que o Vite use a raiz do repositório
    // Remova a linha "root: 'public',"

    // ... (o resto do código fica igual)

    build: {
        // 3. outDir agora é 'dist' dentro da raiz do projeto (sem '../')
        outDir: 'dist', 
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