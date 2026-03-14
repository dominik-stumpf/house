const playerTilePos = { x: 5, y: 5 } as const;

const world = {
	tileSize: 50,
	map: [
		createWall(1, 1),
		createWall(2, 1),
		createWall(4, 1),
		createWall(0, 0),
		createWall(9, 9),
		{ type: "Player", ...playerTilePos } as const,
	],
} as const;

const player = {
	pos: {
		x: world.tileSize * playerTilePos.x,
		y: world.tileSize * playerTilePos.y,
	},
	vel: {
		x: 0,
		y: 0,
	},
};

const intent = { x: 0, y: 0 };

function createWall(x: number, y: number) {
	return { type: "Wall", x, y } as const;
}

function drawWorld(c: CanvasRenderingContext2D) {
	for (const cell of world.map) {
		switch (cell.type) {
			case "Wall":
				c.fillStyle = "coral";
				c.fillRect(
					cell.x * world.tileSize,
					cell.y * world.tileSize,
					world.tileSize,
					world.tileSize,
				);
				break;
			case "Player":
				c.fillStyle = "violet";
				c.fillRect(player.pos.x, player.pos.y, world.tileSize, world.tileSize);
				break;
			default:
				throw new Error("type not impl");
		}
	}
}

function registerIntentByKeypress() {
	const y = ["KeyW", "KeyS"];
	const x = ["KeyA", "KeyD"];

	function getNewIntent(intent: number, newIndex: number, assignZero: boolean) {
		if (newIndex !== -1) {
			const newIntent = newIndex * 2 - 1;
			if (intent !== newIntent * -1) {
				intent = assignZero ? 0 : newIntent;
			}
		}
		return intent;
	}

	window.addEventListener("keydown", (e) => {
		intent.y = getNewIntent(intent.y, y.indexOf(e.code), false);
		intent.x = getNewIntent(intent.x, x.indexOf(e.code), false);
	});
	window.addEventListener("keyup", (e) => {
		intent.y = getNewIntent(intent.y, y.indexOf(e.code), true);
		intent.x = getNewIntent(intent.x, x.indexOf(e.code), true);
	});
}

function drawFrame(c: CanvasRenderingContext2D) {
	const length = Math.sqrt(Math.abs(intent.x) + Math.abs(intent.y)) || 1;
	player.vel.x = (intent.x / length) * 2;
	player.vel.y = (intent.y / length) * 2;

	player.pos.x += player.vel.x;
	player.pos.y += player.vel.y;

	drawWorld(c);
}

export const tdcoll = { drawFrame, drawWorld, registerIntentByKeypress };
