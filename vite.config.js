import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    // logLevel: 'warning',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    minify: 'terser',
    terserOptions: {
        compress: {
            passes: 2
        },
        mangle: true,
        format: {
            comments: false
        }
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
