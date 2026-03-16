<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { tdcoll } from "./tdcoll";
	import { browser } from "$app/environment";
	let canvas: HTMLCanvasElement;
	let c: CanvasRenderingContext2D;
	let cleanupKeypress: () => void;
	let animationFrameId: number;

	function animate() {
		c.clearRect(0, 0, canvas.width, canvas.height);
		tdcoll.drawFrame(c);
		animationFrameId = requestAnimationFrame(animate);
	}

	onMount(() => {
		canvas.width = canvas.clientWidth * devicePixelRatio;
		canvas.height = canvas.clientWidth * devicePixelRatio;

		tdcoll.resizeWorld({
			dimensions: { x: canvas.width, y: canvas.height },
			tileSize: canvas.width / 10,
		});
		cleanupKeypress = tdcoll.registerIntentByKeypress();
		const nullableCtx = canvas.getContext("2d");
		if (!nullableCtx) {
			throw Error("failed to get canvas context");
		}
		c = nullableCtx;
		animate();
	});

	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(animationFrameId);
			cleanupKeypress();
		}
	});
</script>

<figure>
	<canvas bind:this={canvas} class="size-full border"></canvas>
	<figcaption><code>WASD</code> to move</figcaption>
</figure>

<style>
	canvas {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}
</style>
