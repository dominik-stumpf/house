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
		tdcoll.registerIntentByKeypress();
		const nullableCtx = canvas.getContext("2d");
		if (!nullableCtx) {
			throw Error("failed to get canvas context");
		}
		c = nullableCtx;
		c.lineWidth = 10;
		animate();
	});
</script>

<div>do canvas viewer</div>

<canvas bind:this={canvas} width="500" height="500" class="border"></canvas>
