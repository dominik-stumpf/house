<script lang="ts">
	import { resolve } from "$app/paths";
	import type { page } from "$app/state";
	import Boundary from "$lib/components/Boundary.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	import Prose from "$lib/components/Prose.svelte";
	import { config } from "$lib/config";
	import { tz } from "$lib/tz";
	import { trans } from "$lib/trans";
	import { spread } from "$lib/spread";

	const paths = {
		"/projects/astral-playland": import("./astral-playland/+page.svx"),
		"/projects/shaderkit": import("./shaderkit/+page.svx"),
		"/projects/top-down-collision": import("./top-down-collision/+page.svx"),
	} as const satisfies Partial<
		Record<typeof page.url.pathname, Promise<typeof import("*.svx")>>
	>;

	const projects = await Promise.all(
		Object.entries(paths).map(async ([href, path]) => {
			const { metadata } = await path;
			return {
				path: href as keyof typeof paths,
				metadata: trans.newProjectMetadata(metadata),
			};
		}),
	);

	projects.sort(
		(a, b) =>
			b.metadata.publishedAt.valueOf() - a.metadata.publishedAt.valueOf(),
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<svelte:head>
	<title>Projects</title>
</svelte:head>

<Header />

<Boundary>
	<Prose>
		<h2>Projects</h2>
		<p>
			My thought process on various experiments or solutions written mostly for
			myself for later reference.
		</p>
		<main class="flex flex-col gap-6 py-4">
			{#each projects as project (project.path)}
				<a href={resolve(project.path)} class="no-underline">
					<section class="bg-card rounded border border-border p-6">
						<h3 class="mt-0!">{project.metadata.title}</h3>
						<p
							class="not-prose mt-3 line-clamp-2 text-sm font-normal text-muted-foreground"
						>
							{project.metadata.lead}
						</p>
						<div
							class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
						>
							<time
								datetime={new Date(project.metadata.publishedAt).toISOString()}
								>{tz.formatPrettyDate(project.metadata.publishedAt)}</time
							>
							<!-- / -->
							<!-- <span>{project.readTimeResults.text}</span> -->
							<!-- {#if project.metadata.keyphrases}
						::
						{#each project.metadata.keyphrases.slice(0, 2) ?? [] as keyword}
							<code>{keyword}</code>
						{/each}
					{/if} -->
							<!-- <span class={views ? 'visible' : 'invisible'}>::</span>
					{#if views}
						<span
							class="inline-flex items-center gap-1"
							title={`${views.find(({ id }) => id === project.id)?.views} Unique views`}
						>
							<CursorClickIcon class="text-muted-foreground size-4" />
							{formatToCompactNumber(
								// @ts-expect-error ids are validated already
								views.find(({ id }) => id === project.id).views
							)}</span
						>
					{:else}
						<span class="invisible inline-flex items-center gap-1">
							<CursorClickIcon class="text-muted-foreground size-4" />
							---</span
						>
					{/if} -->
						</div>
					</section>
				</a>
			{/each}
			<!-- <h2>Showcases</h2> -->
			<!-- <h2>Guides</h2> -->
		</main>
		<blockquote>
			All entries, assets are version controlled. To see version history, refer
			to the
			<a
				href={`${config.platformLinks.forgejo}/house`}
				{...spread.externalLink()}
			>
				page's repository.</a
			>
			Also note that the projects currently live on
			<a href={config.platformLinks.github}>GitHub</a>, however I'm in the
			process of moving them to
			<a href={`${config.platformLinks.forgejo}`} {...spread.externalLink()}>
				a self-hosted forgejo instance.
			</a>
		</blockquote>
	</Prose>
</Boundary>

<Footer />
