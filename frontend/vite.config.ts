import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";

export default defineConfig({
	server: {
		proxy: {
			"/api": "http://localhost:8787",
		},
	},
	plugins: [tailwindcss(), sveltekit(), sveltePhosphorOptimize()],
});
