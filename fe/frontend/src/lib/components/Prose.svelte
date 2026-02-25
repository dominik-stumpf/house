<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<article
	class="prose prose-sm max-w-prose prose-neutral sm:prose-base lg:prose-lg dark:prose-invert"
>
	{@render children()}
</article>
