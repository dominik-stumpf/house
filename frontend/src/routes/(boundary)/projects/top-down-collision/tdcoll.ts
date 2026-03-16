const playerTilePos = { x: 2, y: 3 } as const;

const world = {
	tileSize: 50,
	dimensions: { x: 500, y: 500 },
	grid: [
		{ type: "Player", ...playerTilePos } as const,
		createWall(1, 1),
		createWall(2, 1),
		createWall(4, 1),
		createWall(0, 0),
		createWall(9, 9),
		createWall(5, 5),
		createWall(6, 5),
		createWall(7, 5),
		createWall(5, 7),
		createWall(7, 7),
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
	speed: 5,
	colliderRadius: world.tileSize * 0.49,
	get center() {
		return {
			x: player.pos.x + world.tileSize / 2,
			y: player.pos.y + world.tileSize / 2,
		};
	},
};

const movementIntent = { x: 0, y: 0 };

function createWall(x: number, y: number) {
	return { type: "Wall", x, y } as const;
}

function drawWorld(c: CanvasRenderingContext2D) {
	for (const cell of world.grid) {
		switch (cell.type) {
			case "Player":
				c.fillStyle = "#aa3322aa";
				c.fillRect(player.pos.x, player.pos.y, world.tileSize, world.tileSize);
				break;
			case "Wall":
				c.fillStyle = "#2233aaaa";
				c.fillRect(
					cell.x * world.tileSize,
					cell.y * world.tileSize,
					world.tileSize,
					world.tileSize,
				);
				break;
			default:
				throw new Error("cell type not implemented");
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
		movementIntent.y = getNewIntent(movementIntent.y, y.indexOf(e.code), false);
		movementIntent.x = getNewIntent(movementIntent.x, x.indexOf(e.code), false);
	});
	window.addEventListener("keyup", (e) => {
		movementIntent.y = getNewIntent(movementIntent.y, y.indexOf(e.code), true);
		movementIntent.x = getNewIntent(movementIntent.x, x.indexOf(e.code), true);
	});
}

// == vec2
type Vec2 = { x: number; y: number };

const vec2 = {
	convertToKey(v: Vec2) {
		return `${v.x}-${v.y}`;
	},
	length(v: Vec2) {
		return v.x ** 2 + v.y ** 2;
	},
	distance(v1: Vec2, v2: Vec2) {
		return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
	},
	lengthSqrt(v: Vec2) {
		return Math.sqrt(vec2.length(v));
	},
} as const;
// == vec2

// == collisionsystem
class CollisionSystem {
	private readonly obstacles: Map<string, Vec2>;
	private readonly tileSize: number;
	private readonly boundaryDimensions: Vec2;
	readonly negligibleDelta = 0.001;

	constructor(obstacles: Vec2[], tileSize: number, boundaryDimensions: Vec2) {
		this.obstacles = new Map(
			obstacles.map((cell) => [vec2.convertToKey(cell), cell]),
		);
		this.tileSize = tileSize;
		this.boundaryDimensions = boundaryDimensions;
	}

	isCircleIntersectsCell(center: Vec2, radius: number, gridPos: Vec2) {
		const minPos = {
			x: gridPos.x * this.tileSize,
			y: gridPos.y * this.tileSize,
		};
		const maxPos = {
			x: minPos.x + this.tileSize,
			y: minPos.y + this.tileSize,
		};
		const closestEdge = {
			x: Math.min(Math.max(center.x, minPos.x), maxPos.x),
			y: Math.min(Math.max(center.y, minPos.y), maxPos.y),
		};

		return vec2.distance(closestEdge, center) <= radius ** 2;
	}

	isCircleWithinBounds(center: Vec2, radius: number) {
		return (
			center.x - radius >= 0 &&
			center.x + radius <= this.boundaryDimensions.x &&
			center.y - radius >= 0 &&
			center.y + radius <= this.boundaryDimensions.y
		);
	}

	isCircleColliding(center: Vec2, radius: number) {
		if (!this.isCircleWithinBounds(center, radius)) {
			return true;
		}
		const gridMin = {
			x: Math.floor((center.x - radius) / this.tileSize),
			y: Math.floor((center.y - radius) / this.tileSize),
		};
		const gridMax = {
			x: Math.floor((center.x + radius) / this.tileSize),
			y: Math.floor((center.y + radius) / this.tileSize),
		};
		for (let gridY = gridMin.y; gridY <= gridMax.y; gridY++) {
			for (let gridX = gridMin.x; gridX <= gridMax.x; gridX++) {
				const gridPos = { x: gridX, y: gridY };
				const cell = this.obstacles.get(vec2.convertToKey(gridPos));
				if (cell && this.isCircleIntersectsCell(center, radius, gridPos)) {
					return true;
				}
			}
		}

		return false;
	}

	findValidPos(start: Vec2, end: Vec2, radius: number) {
		const delta = { x: end.x - start.x, y: end.y - start.y };
		if (vec2.length(delta) < this.negligibleDelta) {
			return start;
		}

		const maxStep = this.tileSize * 0.15;
		const steps = Math.max(Math.ceil(vec2.length(delta) / maxStep), 1);
		const step = { x: delta.x / steps, y: delta.y / steps };
		let validPos = start;
		for (let i = 0; i < steps; i++) {
			const stepPos = { x: validPos.x + step.x, y: validPos.y + step.y };
			if (!this.isCircleColliding(stepPos, radius)) {
				validPos = stepPos;
			} else {
				const slideX = { x: stepPos.x, y: validPos.y };
				if (!this.isCircleColliding(slideX, radius)) {
					validPos = slideX;
					continue;
				}
				const slideY = { x: validPos.x, y: stepPos.y };
				if (!this.isCircleColliding(slideY, radius)) {
					validPos = slideY;
					continue;
				}
				break;
			}
		}
		return validPos;
	}
}
// == collisionsystem

const collision = new CollisionSystem(
	world.grid.filter((cell) => cell.type === "Wall"),
	world.tileSize,
	world.dimensions,
);

function applyCollisionToPlayer() {
	if (player.vel.x === 0 && player.vel.y === 0) {
		return;
	}

	const desiredPos = {
		x: player.center.x + player.vel.x,
		y: player.center.y + player.vel.y,
	};

	const validPos = collision.findValidPos(
		player.center,
		desiredPos,
		player.colliderRadius,
	);

	const affectedVel = {
		x: validPos.x - player.center.x,
		y: validPos.y - player.center.y,
	};

	const displacement = vec2.length({
		x: affectedVel.x - player.vel.y,
		y: affectedVel.y - player.vel.y,
	});

	if (displacement > collision.negligibleDelta || displacement === 0) {
		player.vel = affectedVel;
	}
}

function drawFrame(c: CanvasRenderingContext2D) {
	const length = vec2.lengthSqrt(movementIntent) || 1;
	player.vel.x = (movementIntent.x / length) * player.speed;
	player.vel.y = (movementIntent.y / length) * player.speed;

	applyCollisionToPlayer();

	player.pos.x += player.vel.x;
	player.pos.y += player.vel.y;

	drawWorld(c);
}

export const tdcoll = { drawFrame, registerIntentByKeypress };
