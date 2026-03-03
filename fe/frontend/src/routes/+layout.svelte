<script lang="ts">
	import { config } from '$lib/config';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="description" content={config.site.description} />
	<meta property="og:url" content={config.site.link} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={config.site.title} />
	<meta property="og:description" content={config.site.description} />
	<meta property="og:image" content={config.site.splashImageAbsolutePath} />

	<link rel="canonical" href={config.site.link} />
	<link rel="author" href={config.site.link} />
	<!-- TODO <meta
    name="google-site-verification"
    content=""
  /> -->

	<meta name="application-name" content={config.site.title} />
	<meta name="author" content={config.site.maintainerName} />
	<meta name="creator" content={config.site.maintainerName} />

	<meta
		name="theme-color"
		media="(prefers-color-scheme: dark)"
		content="#000000"
	/>
	<meta
		name="theme-color"
		media="(prefers-color-scheme: light)"
		content="#ffffff"
	/>
	<meta name="color-scheme" content="dark light" />
	<!-- TODO icons <link rel="manifest" href="/manifest.webmanifest" /> -->
	<meta name="theme-color" content="#fff" />
	<meta name="application-name" content="Dominik Stumpf" />
</svelte:head>

{@render children()}
