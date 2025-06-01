<script lang="ts">
  import { redirect } from "@sveltejs/kit";
  import "../app.css";

  let { children } = $props();
</script>

{@render children()}
