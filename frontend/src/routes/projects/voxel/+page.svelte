<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { voxel } from "./voxel";
	import { browser } from "$app/environment";
	let canvas: HTMLCanvasElement;

	onMount(() => {
		voxel.setupPipeline(canvas);
	});

	onDestroy(() => {
		if (browser) {
			voxel.cleanupPipeline();
		}
	});
</script>

<div class="h-screen">
	<canvas bind:this={canvas} class="size-full border"></canvas>
</div>

<style>
	canvas {
		image-rendering: pixelated;
	}
</style>
