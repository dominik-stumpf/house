import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { join } from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		experimental: { async: true }
	},
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		})
	},
	preprocess: [
		mdsvex({
			layout: {
				project: join(
					import.meta.dirname,
					'./src/lib/components/ProjectLayout.svelte'
				)
			}
		})
	],
	extensions: ['.svelte', '.svx']
};

export default config;
