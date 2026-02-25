<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<nav class="flex gap-4 font-mono print:hidden">
	<a href={resolve('/')}>Home</a>
	<a href={resolve('/projects')}>Projects</a>
</nav>
