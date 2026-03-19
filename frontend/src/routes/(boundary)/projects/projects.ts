import type { page } from "$app/state";
import { config } from "$lib/config";
import { trans } from "$lib/trans";

const paths = {
	"/projects/astral-playland": import("./astral-playland/+page.svx"),
	"/projects/shaderkit": import("./shaderkit/+page.svx"),
	"/projects/top-down-collision": import("./top-down-collision/+page.svx"),
	"/projects/proof-of-life": import("./proof-of-life/+page.svx"),
} as const satisfies Partial<
	Record<typeof page.url.pathname, Promise<typeof import("*.svx")>>
>;

export const projects = (
	await Promise.all(
		Object.entries(paths).map(async ([href, path]) => {
			const { metadata } = await path;
			return {
				path: href as keyof typeof paths,
				metadata: trans.newProjectMetadata(metadata),
			};
		}),
	)
).toSorted(
	(a, b) => b.metadata.publishedAt.valueOf() - a.metadata.publishedAt.valueOf(),
);

export async function getViews(): Promise<Record<string, number>> {
	return fetch(new URL("/api/dates", config.api))
		.then((res) => res.json())
		.then((data) => {
			const d = data as unknown as Record<string, number>;
			const result = projects.map((p) => {
				const entry = Object.entries(d).find(([key]) =>
					p.metadata.publishedAt.toISOString().startsWith(key),
				);
				return [p.path, entry?.at(1) ?? 0];
			});
			return Object.fromEntries(result);
		});
}
