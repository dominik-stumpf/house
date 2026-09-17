function isValidDate(tm: Date): boolean {
	const year = tm.getUTCFullYear();
	return year >= 2020 && year <= 2040;
}

async function isRateLimited(request: Request): Promise<boolean> {
	const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
	const cache = caches.default;
	const key = new Request(`https://rl.internal/read/${ip}`);
	const hit = await cache.match(key);
	if (hit) return true;
	await cache.put(key, new Response(null, { headers: { "Cache-Control": "max-age=5" } }));
	return false;
}

async function handleRead(pathname: string, request: Request, env: Env): Promise<Response> {
	if (await isRateLimited(request)) return new Response(null, { status: 429 });

	const raw = pathname.slice("/api/read/".length);
	const seconds = Number(raw);
	if (!Number.isFinite(seconds)) return new Response(null, { status: 400 });

	const tm = new Date(seconds * 1000);
	if (!isValidDate(tm)) return new Response(null, { status: 400 });

	const dateOnly = tm.toISOString().slice(0, 10);
	await env.DB.prepare(
		`INSERT INTO visits (published_at, count) VALUES (?, 1)
		 ON CONFLICT(published_at) DO UPDATE SET count = count + 1`,
	)
		.bind(dateOnly)
		.run();

	return new Response(null, { status: 204 });
}

async function handleDates(env: Env): Promise<Response> {
	const { results } = await env.DB.prepare(
		`SELECT published_at, count FROM visits`,
	).all<{ published_at: string; count: number }>();

	const visits: Record<string, number> = {};
	for (const row of results) {
		visits[row.published_at] = row.count;
	}

	return Response.json(visits);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		try {
			if (request.method === "GET" && url.pathname.startsWith("/api/read/")) {
				return await handleRead(url.pathname, request, env);
			}

			if (request.method === "GET" && url.pathname === "/api/dates") {
				return await handleDates(env);
			}

			return new Response(null, { status: 404 });
		} catch (error) {
			console.error(
				JSON.stringify({
					message: "unhandled error",
					error: error instanceof Error ? error.message : String(error),
					path: url.pathname,
				}),
			);
			return Response.json({ error: "internal server error" }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
