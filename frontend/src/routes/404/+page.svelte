<script lang="ts">
	import { resolve } from "$app/paths";
	import { ArrowLeftIcon } from "phosphor-svelte";
</script>

<svelte:head>
	<link rel="prefetch" href={resolve("/projects")} as="document" />
</svelte:head>

<main class="flex h-screen flex-col items-center justify-center px-8 py-16">
	<h1 class="text-3xl font-bold tracking-tight">404</h1>
	<p class="text-muted-foreground">Not Found</p>
	<a href={resolve("/")} class="mt-8 flex items-center gap-2"
		><ArrowLeftIcon /> return home</a
	>
</main>
