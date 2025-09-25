<script lang="ts">
  let { children } = $props();
</script>

<div class="mx-8">
  <div class="mx-auto my-16 prose prose-neutral md:my-24 lg:my-28 lg:prose-lg dark:prose-invert">
    {@render children()}
  </div>
</div>
