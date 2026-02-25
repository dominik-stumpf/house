<script lang="ts">
	import { resolve } from '$app/paths';
	import Prose from '$lib/components/Prose.svelte';
</script>

<svelte:head>
	<link rel="prefetch" href={resolve('/projects')} as="document" />
</svelte:head>

<Prose>
	<h1>about me</h1>
	<p class="lead">lead text</p>
</Prose>
