<script lang="ts">
  import { onMount } from "svelte";
  let heartState = 0;
  const sourceUrl = "http://localhost:8329";

  onMount(() => {
    const eventSource = new EventSource(new URL("/stream", sourceUrl));
    let timeoutId: number | undefined;
    let counter = 0;
    let bpm: number | undefined;

    let intervalId = setInterval(() => {
      bpm = counter * 6;
      console.log(`bpm estimate ${bpm} ${counter}`);
      counter = 0;
    }, 10_000);

    eventSource.onmessage = (event: MessageEvent) => {
      if (event.data === "b") {
        heartState = 1;
        counter += 1;
        const cooldown =
          (bpm ? Math.max(100, 270 - bpm ** 1 / 2) : 250) +
          Math.round(Math.random() * 8 - 4);
        console.log(cooldown);
        if (timeoutId === undefined) {
          timeoutId = setTimeout(() => {
            heartState = 0;
            timeoutId = undefined;
          }, cooldown);
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      eventSource.close();
    };
  });
</script>

<svelte:head>
  <title>POF</title>
</svelte:head>
<output class="text-4xl font-mono">{heartState}</output>
