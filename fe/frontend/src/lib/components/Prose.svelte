<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<article class="prose prose-sm prose-neutral sm:prose-base dark:prose-invert">
	{@render children()}
</article>
