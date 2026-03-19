<script lang="ts" module>
	import ExternalLink from "$lib/components/ExternalLink.svelte";
	const a = ExternalLink;
	export { a };
</script>

<script lang="ts">
	import Boundary from "$lib/components/Boundary.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	import Prose from "$lib/components/Prose.svelte";
	import type { Snippet } from "svelte";
	import { trans } from "$lib/trans";
	import { config } from "$lib/config";

	export type ProjectMetadata = {
		title: string;
		lead: string;
		publishedAt: Date;
		layout: "project";
	};

	let {
		children,
		title,
		lead,
		publishedAt,
		layout,
	}: { children: Snippet } & ProjectMetadata = $props();

	// svelte-ignore state_referenced_locally
	const m = trans.newProjectMetadata({
		title,
		lead,
		publishedAt,
		layout,
	} satisfies ProjectMetadata);
</script>

<svelte:head>
	<link
		as="fetch"
		href={new URL(`/api/read/${m.publishedAt.valueOf() / 1000}`, config.api)
			.href}
		crossorigin="anonymous"
		rel="preload"
	/>
	<title>{m.title}</title>
</svelte:head>

<Header />
<main>
	<Boundary>
		<Prose>
			<h1>{m.title}</h1>
			<p class="lead">{m.lead}</p>
			{@render children()}
		</Prose>
	</Boundary>
</main>
<Footer />
