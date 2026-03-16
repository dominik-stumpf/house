<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

<article
	class="prose prose-sm wrap-break-word prose-neutral sm:prose-base dark:prose-invert print:prose-sm prose-pre:leading-relaxed prose-table:overflow-auto"
>
	{@render children()}
</article>
