import type { page } from "$app/state";

const domain = "zgzg.dev";

const navigation = {
	about: "/",
	resume: "/resume",
	projects: "/projects",
} as const satisfies Record<string, typeof page.url.pathname>;

const site = {
	title: "Dominik Stumpf",
	maintainerName: "Dominik Stumpf",
	maintainerEmail: "echo@zgzg.dev",
	description: "Backend oriented Fullstack web developer.",
	link: `https://${domain}`,
	splashImageAbsolutePath: `https://${domain}/media/homepage-splash.png`,
	navigation,
} as const;

const targetTimeZone = "Europe/Budapest";

const platformLinks = {
	github: "https://github.com/dominik-stumpf",
	forgejo: `https://git.${domain}/zgzg`,
	linkedin: "https://linkedin.com/in/dominik-stumpf",
	astralPlayland: "https://astral-playland.vercel.app",
	shaderkit: `https://shaderkit.${domain}`,
	email: `mailto:${site.maintainerEmail}`,
} as const;

const platformNavigation = [
	{
		href: platformLinks.linkedin,
		name: "LinkedIn",
	},
	{
		href: platformLinks.github,
		name: "GitHub",
	},
] as const;

export const config = {
	api: import.meta.env.DEV ? "http://localhost:8888" : site.link,
	site,
	targetTimeZone,
	navigation,
	platformLinks,
	platformNavigation,
} as const;
