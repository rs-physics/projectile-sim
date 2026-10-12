import { defineConfig } from 'vite';

export default defineConfig({
    base: '/projectile-sim/',

    server: {
        watch: {
            usePolling: true,
        },
    },
});