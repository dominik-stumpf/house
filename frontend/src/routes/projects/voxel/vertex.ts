// function generateHeightmap(size = 32, max = 5) {
// 	const map = [];

// 	for (let y = 0; y < size; y++) {
// 		map[y] = [];
// 		for (let x = 0; x < size; x++) {
// 			let value;

// 			if (x > 0 && Math.random() < 0.7) {
// 				value = map[y][x - 1]; // copy left
// 			} else if (y > 0 && Math.random() < 0.7) {
// 				value = map[y - 1][x]; // copy top
// 			} else {
// 				value = Math.floor(Math.random() * (max + 1));
// 			}

// 			map[y][x] = value;
// 		}
// 	}

// 	return map;
// }

function generateHeightmap(size = 128) {
	const map: number[][] = [];

	for (let y = 0; y < size; y++) {
		map[y] = [];
		for (let x = 0; x < size; x++) {
			let color = fbm([x / size, y / size].map((v) => v * 5));
			color += 1;
			color *= 3.5;
			color = color - (color % 1);
			map[y][x] = color;
		}
	}

	return map;
}

function fbm(uv: number[]) {
	let v = 0.0;
	let amp = 0.5;
	let freq = 1.0;
	for (let i = 0; i < 5; i++) {
		v += amp * noise(uv.map((v) => v * freq));
		freq *= 2.0;
		amp *= 0.5;
	}
	return v;
}

function noise(uv: number[]) {
	const i = floor(uv);
	const f = fract(uv);

	const a = random(i);
	const b = random([i[0] + 1.0, i[1]]);
	const c = random([i[0], i[1] + 1.0]);
	const d = random([i[0] + 1.0, i[1] + 1.0]);

	const u = f.map((v) => v * v * (3.0 - 2.0 * v));

	return (
		mix(a, b, u[0]) + (c - a) * u[1] * (1.0 - u[0]) + (d - b) * u[0] * u[1]
	);
}

function mix(x: number, y: number, a: number) {
	return x * (1 - a) + y * a;
}

function dot(vec1: number[], vec2: number[]) {
	let sum = 0;
	for (let i = 0; i < vec1.length; i++) {
		sum += vec1[i] * (vec2[i] ?? 0);
	}
	return sum;
}

function fract(vec: number[]) {
	return vec.map((v) => v % 1);
}

function floor(vec: number[]) {
	return vec.map((v) => Math.floor(v));
}

function random(uv: number[]) {
	return (Math.sin(dot(uv, [12.9898, 78.233])) * 43758.5453123) % 1;
}

// prettier-ignore
function createCubeVertices() {
  const positions = [
    // left
    0, 0,  0,
    0, 0, -1,
    0, 1,  0,
    0, 1, -1,

    // right
    1, 0,  0,
    1, 0, -1,
    1, 1,  0,
    1, 1, -1,
  ];

  const indices = [
     0,  2,  1,    2,  3,  1,   // left
     4,  5,  6,    6,  5,  7,   // right
     0,  4,  2,    2,  4,  6,   // front
     1,  3,  5,    5,  3,  7,   // back
     0,  1,  4,    4,  1,  5,   // bottom
     2,  6,  3,    3,  6,  7,   // top
  ];

  const quadColors = [
      200,  70, 120,  // left column front
       80,  70, 200,  // left column back
       70, 200, 210,  // top
      160, 160, 220,  // top rung right
       90, 130, 110,  // top rung bottom
      200, 200,  70,  // between top and middle rung
  ];

  const numVertices = indices.length;
  const vertexData = new Float32Array(numVertices * 4); // xyz + color
  const colorData = new Uint8Array(vertexData.buffer);

  for (let i = 0; i < indices.length; ++i) {
    const positionNdx = indices[i] * 3;
    const position = positions.slice(positionNdx, positionNdx + 3);
    vertexData.set(position, i * 4);

    const quadNdx = (i / 6 | 0) * 3;
    const color = quadColors.slice(quadNdx, quadNdx + 3);
    colorData.set(color, i * 16 + 12);
    colorData[i * 16 + 15] = 255;
  }

  return {
    vertexData,
    numVertices,
  };
}

export const vertex = {
	generateHeightmap,
	createCubeVertices,
};
