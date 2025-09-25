<script lang="ts">
  import { onMount } from "svelte";
  let heartState = 0;

  onMount(() => {
    const eventSource = new EventSource(new URL("/stream"));
    let timeoutId: number | undefined;
    let counter = 0;
    let bpm: number | undefined;

    let intervalId = setInterval(() => {
      bpm = counter * 6;
      // console.log(`bpm estimate ${bpm} ${counter}`);
      counter = 0;
    }, 10_000);

    eventSource.onmessage = (event: MessageEvent) => {
      if (event.data === "b") {
        heartState = 1;
        counter += 1;
        const cooldown =
          (bpm ? Math.max(100, 270 - bpm ** 1 / 2) : 250) + Math.round(Math.random() * 8 - 4);
        // console.log(cooldown);
        if (timeoutId === undefined) {
          timeoutId = window.setTimeout(() => {
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
  <title>proof of life</title>
</svelte:head>
<output class="font-mono text-4xl">{heartState}</output>
