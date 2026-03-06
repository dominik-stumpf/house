import { mdsvex, escapeSvelte } from "mdsvex";
import adapter from "@sveltejs/adapter-static";
import { join } from "node:path";
import { createHighlighter } from "shiki";

const highlighter = await createHighlighter({
	themes: ["vitesse-black", "vitesse-light"],
	langs: ["ts", "js"],
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: [".svx", ".md"],
	highlight: {
		highlighter: async (code, lang = "text") => {
			const html = escapeSvelte(
				highlighter.codeToHtml(code, {
					lang,
					themes: {
						light: "vitesse-light",
						dark: "vitesse-black",
					},
					defaultColor: "light-dark()",
				}),
			);
			return `{@html \`${html}\` }`;
		},
	},
	layout: {
		project: join(
			import.meta.dirname,
			"./src/lib/components/ProjectLayout.svelte",
		),
	},
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		experimental: { async: true },
	},
	kit: {
		paths: {
			// base: "/assets",
			relative: false,
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: "../backend/spa_routes",
			assets: "../backend/spa_assets",
			// fallback: "404.html",
			// precompress: true,
			strict: true,
		}),
	},
	preprocess: [mdsvex(mdsvexOptions)],
	extensions: [".svelte", ".svx"],
};

export default config;
