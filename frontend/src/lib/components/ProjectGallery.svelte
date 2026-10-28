<script lang="ts">
	type GalleryImage = { src: string; alt: string; aspect: number };

	let { images }: { images: GalleryImage[] } = $props();
</script>

<div class="my-8 flex flex-col items-start gap-4 sm:flex-row sm:items-start">
	{#each images as image (image.src)}
		<img
			src={image.src}
			alt={image.alt}
			class="mx-auto h-auto max-w-72 !my-0 sm:mx-0 sm:max-w-none sm:min-w-0"
			style={`aspect-ratio: ${image.aspect}; flex: ${image.aspect} 1 0;`}
		/>
	{/each}
</div>
