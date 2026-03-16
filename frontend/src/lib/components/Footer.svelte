<script lang="ts">
	import { browser } from "$app/environment";
	import { config } from "$lib/config";
	import { tz } from "$lib/tz";
	import Boundary from "./Boundary.svelte";
	import { spread } from "$lib/spread";

	let offset = $state(tz.getTimeZoneOffset(config.targetTimeZone));
	const offsetMeasurement = $derived(offset.offsetMeasurement);
	const time = $derived(offset.time);
	const offsetHour = $derived(Math.abs($offsetMeasurement.timeZoneOffsetHour));
	const offsetState = $derived(
		tz.determineTimeZoneOffsetState($offsetMeasurement.timeZoneOffsetHour),
	);
	const offsetMessageMap = $derived(
		new Map([
			[tz.offsetState.SameTimeZone, "same time zone"],
			[tz.offsetState.Behind, `${offsetHour}h behind`],
			[tz.offsetState.Ahead, `${offsetHour}h ahead`],
		]),
	);
</script>

<footer class="mt-8">
	<Boundary>
		<div class="flex flex-col flex-wrap justify-between gap-8 print:hidden">
			<div class="flex flex-wrap gap-4 font-mono text-sm">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={config.platformLinks.email}>Email</a>
				{#each config.platformNavigation as link (link.name)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={link.href} {...spread.externalLink()}>{link.name}</a>
				{/each}
			</div>
			{#if browser}
				<span class="font-mono text-sm font-thin">
					<time dateTime={$time.toISOString()}>
						{$offsetMeasurement.targetTime},
					</time>
					<span
						title={`Time zone difference between ${offset.localTimeZone} and ${offset.targetTimeZone}`}
						>{offsetMessageMap.get(offsetState)}</span
					>
				</span>
			{/if}
		</div>
	</Boundary>
</footer>
