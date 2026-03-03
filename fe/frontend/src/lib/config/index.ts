import type { page } from '$app/state';

const domain = 'zgzg.dev';

const navigation = {
	about: '/',
	resume: '/resume',
	projects: '/projects'
} as const satisfies Record<string, typeof page.url.pathname>;

const site = {
	title: 'Dominik Stumpf',
	maintainerName: 'Dominik Stumpf',
	maintainerEmail: 'echo@zgzg.work',
	description: 'Backend oriented Fullstack web developer.',
	link: `https://${domain}`,
	splashImageAbsolutePath: `https://${domain}/media/homepage-splash.png`,
	navigation
} as const;

const targetTimeZone = 'Europe/Budapest';

const platformLinks = {
	github: 'https://github.com/dominik-stumpf',
	aocRepo: 'https://github.com/dominik-stumpf/advent-of-code',
	linkedin: 'https://linkedin.com/in/dominik-stumpf',
	email: `mailto:${site.maintainerEmail}`
} as const;

const platformNavigation = [
	{
		href: platformLinks.linkedin,
		name: 'LinkedIn'
	},
	{
		href: platformLinks.github,
		name: 'GitHub'
	}
] as const;

export const config = {
	site,
	targetTimeZone,
	navigation,
	platformLinks,
	platformNavigation
} as const;
