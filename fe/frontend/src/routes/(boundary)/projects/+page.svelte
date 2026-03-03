<script lang="ts">
	import Boundary from '$lib/components/Boundary.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
</script>

<Header />
<main>
	<Boundary>
		<h1>Project listing</h1>
		<article>
			<h2>Project 1</h2>
			<p>Project short summary.</p>
		</article>
	</Boundary>
</main>
<Footer />
