<script lang="ts">
	import { spread } from '$lib/spread';
	// import type { HTMLAnchorAttributes } from 'svelte/elements';
	// const { children, ...props }: HTMLAnchorAttributes = $props();
	export let href: string;
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a {href} {...spread.externalLink()}><slot /></a>
