import type { HTMLAnchorAttributes } from "svelte/elements";

function externalLink() {
	return {
		rel: "noopener noreferrer",
		target: "_blank",
	} as const satisfies HTMLAnchorAttributes;
}

export const spread = {
	externalLink,
};
