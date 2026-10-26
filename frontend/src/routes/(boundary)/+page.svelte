<script lang="ts">
	import { resolve } from "$app/paths";
	import Boundary from "$lib/components/Boundary.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	import Prose from "$lib/components/Prose.svelte";
	import { config } from "$lib/config";
	import { spread } from "$lib/spread";
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<svelte:head>
	<link rel="prefetch" href={resolve("/projects")} as="document" />
</svelte:head>

<Header />
<main>
	<Boundary>
		<Prose>
			<h2>{config.site.description}</h2>
			<p>
				Hello! I'm <strong>Dominik Stumpf</strong>, software engineer based in
				Hungary,
				I'm the creator of
				<a href={config.platformLinks.musicPlayer} {...spread.externalLink()}
					>Music Player</a
				>, a local-first music player for your own library, and
				<a href={config.platformLinks.jobBoard} {...spread.externalLink()}
					>Job Board</a
				>, which aggregates and indexes publicly available job postings in one
				place. I
				like building things I find useful myself, rather than settling for
				whatever's already out there. Besides that, I sometimes document my
				tech related
				<a href={resolve("/projects")}>findings or experiments here</a>.
			</p>
			<!-- <p>
				When making websites my ideology is <b>keeping things simple</b> and snappy.
				I enjoy experimenting with modern tech, especially Go and Svelte lately, while
				also appreciating established technologies like PostgreSQL and Unix.
			</p> -->
		</Prose>
	</Boundary>
</main>
<Footer />
