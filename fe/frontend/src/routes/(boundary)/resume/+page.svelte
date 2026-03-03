<script>
	import Prose from '$lib/components/Prose.svelte';
	import { config } from '$lib/config';
	import { spread } from '$lib/spread';
	import Header from '$lib/components/Header.svelte';
	import Boundary from '$lib/components/Boundary.svelte';

	const contactLinks = [
		{ name: 'Email', href: config.platformLinks.email },
		...config.platformNavigation
	];
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<svelte:head>
	<title>Resume</title>
</svelte:head>

<Header />
<main>
	<Boundary>
		<Prose>
			<h1 class="font-serif font-normal tracking-tight text-pretty">
				<i>Dominik Stumpf</i> &mdash;
				<span class="text-muted-foreground">Software engineer</span>
			</h1>

			<h2>Experience</h2>
			<h3 class="mb-0!">ZGEN</h3>
			<time class="text-sm text-muted-foreground">2024-2025</time>
			<p>
				Worked at guild.xyz as a frontend, devops and backend engineer, helped
				laying the foundation of a monorepo during a rewrite.
			</p>

			<h2>Web related</h2>
			<p>
				Javascript (+Typescript) user for more than 3 years. Common technologies
				and tools I use:
			</p>
			<ul>
				<li>Go : Backend language</li>
				<li>PostgreSQL, Redis : Database</li>
				<li>TailwindCSS : CSS framework</li>
				<li>React, Svelte : Component framework</li>
				<li>NextJS, Sveltekit, Hono : App framework</li>
				<li>Figma : UI design tool</li>
				<li>&hellip;</li>
			</ul>

			<h2>Beyond the web</h2>
			<p>
				I'm an avid learner when it comes to programming, I have experience with
				web scraping, basic networking and GNU/Linux. I enjoy maintaining my own
				home lab with FOSS and contribute to tools I find useful.
			</p>

			<h2>Interests</h2>
			<p>Game development, computer graphics, low-level, minimal software</p>
			<div>
				<h2>Contact links</h2>
				<div class="flex flex-col">
					{#each contactLinks as contactLink (contactLink.name)}
						<div>
							{contactLink.name}:
							<a href={contactLink.href} {...spread.externalLink()}
								>{new URL(contactLink.href).hostname +
									new URL(contactLink.href).pathname}</a
							>
						</div>
					{/each}
				</div>
			</div>

			<blockquote class="hidden print:block">
				Note: This is a printed version of my homepage
				<a href={config.site.link} {...spread.externalLink()}
					>{new URL(config.site.link).host}</a
				>, where you can find up to date additional information about me and my
				works. This file was generated at {new Date().toUTCString()}
			</blockquote>
		</Prose>
	</Boundary>
</main>
