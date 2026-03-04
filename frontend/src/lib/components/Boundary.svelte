<script lang="ts">
	import type { Snippet } from "svelte";
	export type Variant = "default" | "prose";

	let {
		variant = "default",
		children,
	}: { children: Snippet; variant?: Variant } = $props();
</script>

<div class="px-4 sm:px-8">
	<div
		class={[
			"mx-auto",
			variant === "default" && "max-w-lg",
			variant === "prose" && "max-w-prose",
		]}
	>
		{@render children()}
	</div>
</div>
