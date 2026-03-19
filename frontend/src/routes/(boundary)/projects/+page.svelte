<script lang="ts">
	import { resolve } from "$app/paths";
	import Boundary from "$lib/components/Boundary.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	import Prose from "$lib/components/Prose.svelte";
	import { config } from "$lib/config";
	import { trans } from "$lib/trans";
	import { spread } from "$lib/spread";
	import { CursorClickIcon } from "phosphor-svelte";
	import { onMount } from "svelte";
	import { getViews, projects } from "./projects";
	import { fly } from "svelte/transition";

	let views: ReturnType<typeof getViews> | undefined = $state();
	onMount(() => {
		views = getViews();
	});
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
			{#each projects as project, i (project.path)}
				<a href={resolve(project.path)} class="no-underline">
					<section
						class="bg-card overflow-hidden rounded border border-border p-6"
					>
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
								>{trans.formatPrettyDate(project.metadata.publishedAt)}</time
							>
							<!-- / -->
							<!-- <span>{project.readTimeResults.text}</span> -->
							<!-- {#if project.metadata.keyphrases}
						::
						{#each project.metadata.keyphrases.slice(0, 2) ?? [] as keyword}
							<code>{keyword}</code>
						{/each}
					{/if} -->
							{#if views}
								{#await views then data}
									<span
										class="inline-flex items-center gap-1"
										transition:fly={{ y: 10, delay: i * 100 }}
									>
										<CursorClickIcon class="text-muted-foreground" />
										{trans.formatCompactNumber(data[project.path])}</span
									>
								{/await}
							{/if}
						</div>
					</section>
				</a>
			{/each}
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
		</blockquote>
	</Prose>
</Boundary>

<Footer />
