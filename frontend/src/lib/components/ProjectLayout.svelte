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
	import { spread } from "$lib/spread";
	import { ArrowUpRightIcon } from "phosphor-svelte";

	export type ProjectMetadata = {
		title: string;
		lead: string;
		publishedAt: Date;
		layout: "project";
		liveUrl?: string;
	};

	let {
		children,
		title,
		lead,
		publishedAt,
		layout,
		liveUrl,
	}: { children: Snippet } & ProjectMetadata = $props();

	// svelte-ignore state_referenced_locally
	const m = trans.newProjectMetadata({
		title,
		lead,
		publishedAt,
		layout,
		liveUrl,
	} satisfies ProjectMetadata);
</script>

<svelte:head>
	<link
		as="fetch"
		href={`/api/read/${m.publishedAt.valueOf() / 1000}`}
		rel="preload external"
	/>
	<title>{m.title}</title>
</svelte:head>

<Header />
<main>
	<Boundary>
		<Prose>
			<h1>{m.title}</h1>
			<p class="lead">{m.lead}</p>
			{#if m.liveUrl}
				<a
					href={m.liveUrl}
					{...spread.externalLink()}
					class="not-prose mb-6 inline-flex w-fit items-center gap-1 rounded border border-border bg-card px-4 py-2 text-sm font-medium no-underline hover:bg-muted"
				>
					Visit {new URL(m.liveUrl).host}
					<ArrowUpRightIcon />
				</a>
			{/if}
			{@render children()}
		</Prose>
	</Boundary>
</main>
<Footer />
