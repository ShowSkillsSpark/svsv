import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    server: {
        watch: {
            usePolling: true,
            interval: 1000,
        },
    },
    define: {
        global: {},
    }
});
