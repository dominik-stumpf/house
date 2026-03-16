import type { ProjectMetadata } from "$lib/components/ProjectLayout.svelte";

function newProjectMetadata(metadata: object): ProjectMetadata {
	const m = structuredClone(metadata);
	if ("publishedAt" in m && typeof m.publishedAt === "string") {
		m.publishedAt = new Date(m.publishedAt);
	}
	if (!("layout" in m) || m.layout !== "project") {
		throw new Error("non project layout given");
	}

	return m as ProjectMetadata;
}

function formatPrettyDate(date: Date) {
	// extra Date wrapper is for client and server side compatibility
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export const trans = {
	newProjectMetadata,
	formatPrettyDate,
};
