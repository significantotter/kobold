import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					// Treat discord-* components as custom elements
					isCustomElement: tag => tag.startsWith('discord-'),
				},
			},
		}),
	],
	envDir: resolve(__dirname, '../..'),
	root: '.',
	publicDir: 'public',
	build: {
		outDir: 'dist/client',
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		proxy: {
			'/api': 'http://localhost:3000',
			'/oauth': 'http://localhost:3000',
			'/health': 'http://localhost:3000',
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'client'),
		},
	},
});
