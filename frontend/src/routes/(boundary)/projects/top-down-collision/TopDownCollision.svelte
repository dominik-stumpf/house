<script lang="ts">
	import { onMount } from "svelte";
	import { tdcoll } from "./tdcoll";
	let canvas: HTMLCanvasElement;
	let c: CanvasRenderingContext2D;

	function animate() {
		c.clearRect(0, 0, canvas.width, canvas.height);
		tdcoll.drawFrame(c);
		requestAnimationFrame(animate);
	}

	onMount(() => {
		canvas.width = canvas.clientWidth * devicePixelRatio;
		canvas.height = canvas.clientWidth * devicePixelRatio;

		tdcoll.resizeWorld({
			dimensions: { x: canvas.width, y: canvas.height },
			tileSize: canvas.width / 10,
		});
		tdcoll.registerIntentByKeypress();
		const nullableCtx = canvas.getContext("2d");
		if (!nullableCtx) {
			throw Error("failed to get canvas context");
		}
		c = nullableCtx;
		animate();
	});
</script>

<div>do canvas viewer</div>

<canvas bind:this={canvas} class="size-full border"></canvas>

<style>
	canvas {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}
</style>
