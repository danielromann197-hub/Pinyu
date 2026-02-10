import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                tienda: resolve(__dirname, 'tienda.html'),
                contacto: resolve(__dirname, 'contacto.html'),
                carrito: resolve(__dirname, 'carrito.html'),
                producto: resolve(__dirname, 'producto.html'),
                sobre: resolve(__dirname, 'sobre.html'),
                faq: resolve(__dirname, 'faq.html'),
            },
        },
    },
    server: {
        proxy: {
            '/create_preference': 'http://localhost:3000'
        }
    },
});
