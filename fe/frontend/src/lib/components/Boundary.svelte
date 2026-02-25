<script lang="ts">
	import type { Snippet } from 'svelte';
	export type Variant = 'default' | 'prose';

	let {
		variant = 'default',
		children
	}: { children: Snippet; variant?: Variant } = $props();
</script>

<div
	class={[
		'mx-auto px-4 sm:px-8',
		variant === 'default' && 'max-w-lg',
		variant === 'prose' && 'max-w-prose'
	]}
>
	{@render children()}
</div>
