<script lang="ts">
	import { config } from "$lib/config";
	import { onDestroy, onMount } from "svelte";
	import { Spring } from "svelte/motion";
	let heartState = $state(0);
	const scale = new Spring(1);
	const bpmSample = 3;
	let eventSource: EventSource | undefined;
	let timeoutId: number | undefined;
	let intervalId: number | undefined;
	let serviceErrorMessage = $state("");

	onMount(async () => {
		const ac = new AbortController();
		const res = await fetch(new URL("/api/pol", config.api), {
			signal: ac.signal,
		});
		ac.abort();
		if (res.status === 503) {
			serviceErrorMessage =
				"Service seems to be unavailable, please try again later.";
			return;
		}
		eventSource = new EventSource(new URL("/api/pol", config.api));
		let timeoutId: number | undefined;
		let counter = 0;
		let bpm: number | undefined;

		intervalId = window.setInterval(() => {
			bpm = counter * (60 / bpmSample);
			counter = 0;
		}, bpmSample * 1_000);
		// let startTime = performance.now();
		// let endTime: number;
		// let prevDiff = 0;
		eventSource.onmessage = (event) => {
			// endTime = performance.now();
			// const diff = Math.round(endTime - startTime);
			// console.log(diff, prevDiff - diff);
			// prevDiff = diff;
			// startTime = endTime;
			if (event.data === "thump") {
				heartState = 1;
				scale.set(Math.min(1.1 + (bpm || 0) / 140, 2), { instant: true });
				scale.set(1.0);
				counter += 1;
				const cooldown =
					(bpm ? Math.max(100, 270 - bpm ** 1 / 2) : 250) +
					Math.round(Math.random() * 8 - 4);
				if (timeoutId === undefined) {
					timeoutId = window.setTimeout(() => {
						heartState = 0;
						timeoutId = undefined;
					}, cooldown);
				}
			}
		};

		eventSource.onerror = () => {
			serviceErrorMessage = "Connection failed, try refreshing.";
			eventSource?.close();
		};
	});
	onDestroy(() => {
		clearInterval(intervalId);
		clearTimeout(timeoutId);
		eventSource?.close();
	});
</script>

<output
	class="inline-block font-mono text-4xl"
	style="transform: scale({scale.current}); font-weight: {Math.min(
		660,
		Math.floor(400 + 1000 * (scale.current - 1)),
	)}">{heartState}</output
>

{#if serviceErrorMessage}
	<p>
		<strong>{serviceErrorMessage}</strong>
	</p>
{/if}
