<script lang="ts">
	import { onMount } from "svelte";
	let canvas: HTMLCanvasElement;
	let c: CanvasRenderingContext2D;

	function createWall(x: number, y: number) {
		return { type: "Wall", x, y } as const;
	}

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

	function drawWorld() {
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
					c.fillRect(
						player.pos.x,
						player.pos.y,
						world.tileSize,
						world.tileSize,
					);
					break;
				default:
					throw new Error("type not impl");
			}
		}
	}

	const intent = { x: 0, y: 0 };
	function registerIntentByKeypress() {
		const y = ["KeyW", "KeyS"];
		const x = ["KeyA", "KeyD"];

		function getNewIntent(
			intent: number,
			newIndex: number,
			assignZero: boolean,
		) {
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

	function drawFrame() {
		const length = Math.sqrt(Math.abs(intent.x) + Math.abs(intent.y)) || 1;
		player.vel.x = (intent.x / length) * 2;
		player.vel.y = (intent.y / length) * 2;

		player.pos.x += player.vel.x;
		player.pos.y += player.vel.y;

		drawWorld();
	}

	function animate() {
		// shouldn't be needed if cleanup is called
		if (!canvas) {
			return;
		}
		c.clearRect(0, 0, canvas.width, canvas.height);

		drawFrame();

		requestAnimationFrame(animate);
	}

	onMount(() => {
		registerIntentByKeypress();
		const nullableCtx = canvas.getContext("2d");
		if (!nullableCtx) {
			throw Error("failed to get canvas context");
		}
		c = nullableCtx;

		c.lineWidth = 10;
		animate();
	});
</script>

<div>do canvas viewer</div>

<canvas bind:this={canvas} width="500" height="500" class="border"></canvas>
