<!-- <script lang="ts"> -->
<!---->
<!--   import svelteLogo from "./assets/svelte.svg"; -->
<!--   import viteLogo from "/vite.svg"; -->
<!--   import Counter from "./lib/Counter.svelte"; -->
<!-- </script> -->
<!---->
<!-- <main> -->
<!--   <div> -->
<!--     <a href="https://vite.dev" target="_blank" rel="noreferrer"> -->
<!--       <img src={viteLogo} class="logo" alt="Vite Logo" /> -->
<!--     </a> -->
<!--     <a href="https://svelte.dev" target="_blank" rel="noreferrer"> -->
<!--       <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" /> -->
<!--     </a> -->
<!--   </div> -->
<!--   <h1>Vite + Svelte</h1> -->
<!---->
<!--   <div class="card"> -->
<!--     <Counter /> -->
<!--   </div> -->
<!---->
<!--   <p> -->
<!--     Check out <a -->
<!--       href="https://github.com/sveltejs/kit#readme" -->
<!--       target="_blank" -->
<!--       rel="noreferrer">SvelteKit</a -->
<!--     >, the official Svelte app framework powered by Vite! -->
<!--   </p> -->
<!---->
<!--   <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p> -->
<!-- </main> -->
<!---->
<!-- <style> -->
<!--   .logo { -->
<!--     height: 6em; -->
<!--     padding: 1.5em; -->
<!--     will-change: filter; -->
<!--     transition: filter 300ms; -->
<!--   } -->
<!--   .logo:hover { -->
<!--     filter: drop-shadow(0 0 2em #646cffaa); -->
<!--   } -->
<!--   .logo.svelte:hover { -->
<!--     filter: drop-shadow(0 0 2em #ff3e00aa); -->
<!--   } -->
<!--   .read-the-docs { -->
<!--     color: #888; -->
<!--   } -->
<!-- </style> -->
<!---->

<script lang="ts">
  import { onMount } from "svelte";
  let heartState = 0;
  const sourceUrl = "https://zgzg.work";

  onMount(() => {
    const eventSource = new EventSource(new URL("/stream", sourceUrl));
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
          (bpm ? Math.max(100, 270 - bpm ** 1 / 2) : 250) +
          Math.round(Math.random() * 8 - 4);
        // console.log(cooldown);
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
  <title>proof of life</title>
</svelte:head>
<output class="text-4xl font-mono">{heartState}</output>
