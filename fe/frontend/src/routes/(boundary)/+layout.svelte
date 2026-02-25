<script lang="ts">
	import Boundary from '$lib/components/Boundary.svelte';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen overflow-y-auto py-16">
	<Header />
	<main>
		<Boundary>
			{@render children()}
		</Boundary>
	</main>
</div>
