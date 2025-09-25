import { mdsvex, escapeSvelte } from "mdsvex";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
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
        })
      );
      return `{@html \`${html}\` }`;
    },
  },
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
  kit: { adapter: adapter() },
  extensions: [".svelte", ".svx", ".md"],
};

export default config;
