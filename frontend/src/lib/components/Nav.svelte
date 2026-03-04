<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { config } from "$lib/config";

	const navlinks = [
		{ href: config.navigation.about, name: "about" },
		{ href: config.navigation.projects, name: "projects" },
		{ href: config.navigation.resume, name: "résumé" },
	] as const;
</script>

<nav
	class="mb-8 flex flex-col gap-2 font-mono sm:flex-row sm:items-center
  print:hidden"
>
	{#each navlinks as navlink, index (navlink.name)}
		<a
			href={resolve(navlink.href)}
			data-active={page.url.pathname === navlink.href}
			class="data-[active=true]:pointer-events-none
      data-[active=true]:font-extralight data-[active=true]:opacity-60"
			>{navlink.name}</a
		>
		{#if index !== navlinks.length - 1}
			<span class="hidden text-muted-foreground select-none sm:block">:</span>
		{/if}
	{/each}
</nav>
