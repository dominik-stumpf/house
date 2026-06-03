import { mat4 } from "./mat4";
import tri from "./tri.wgsl?raw";
import { vertex } from "./vertex";

let animationFrameId: number;

function startAnimationLoop() {
	animationFrameId = requestAnimationFrame(startAnimationLoop);
	console.log("animation start");
}

function cleanupPipeline() {
	cancelAnimationFrame(animationFrameId);
}

interface Renderer {
	canvas: HTMLCanvasElement;
	device: GPUDevice;
	context: GPUCanvasContext;
	pipeline: GPURenderPipeline;
	descriptor?: GPURenderPassDescriptor;
	depthTexture?: GPUTexture;
	scene: any;
}

function roundUp(v: number, alignment: number) {
	return Math.ceil(v / alignment) * alignment;
}

function render(r: Renderer) {
	console.time("encode");
	const objectInfos = [];
	let objectNdx = 0;
	const canvasTexture = r.context.getCurrentTexture();
	if (
		!r.depthTexture ||
		r.depthTexture.width !== canvasTexture.width ||
		r.depthTexture.height !== canvasTexture.height
	) {
		if (r.depthTexture) {
			r.depthTexture.destroy();
		}
		r.depthTexture = r.device.createTexture({
			size: [canvasTexture.width, canvasTexture.height],
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
	}
	r.descriptor = {
		label: "our basic canvas renderPass",
		colorAttachments: [
			{
				view: canvasTexture.createView(),
				loadOp: "clear",
				storeOp: "store",
			},
		],
		depthStencilAttachment: {
			view: r.depthTexture.createView(),
			depthClearValue: 1.0,
			depthLoadOp: "clear",
			depthStoreOp: "store",
		},
	};

	function drawObject(ctx, matrix, color) {
		const { pass, viewProjectionMatrix } = ctx;
		if (objectNdx === objectInfos.length) {
			objectInfos.push(createObjectInfo(r.device, r.pipeline));
		}
		const { matrixValue, colorValue, uniformBuffer, uniformValues, bindGroup } =
			objectInfos[objectNdx++];

		mat4.multiply(viewProjectionMatrix, matrix, matrixValue);
		colorValue.set(color);

		r.device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

		pass.setBindGroup(0, bindGroup);
		pass.draw(r.scene.numVertices);
	}

	const encoder = r.device.createCommandEncoder({ label: "our encoder" });
	const pass = encoder.beginRenderPass(r.descriptor);
	pass.setPipeline(r.pipeline);
	pass.setVertexBuffer(0, r.scene.vertexBuffer);
	const baseRotation = 0;

	const aspect = r.canvas.clientWidth / r.canvas.clientHeight;
	const projection = mat4.perspective(
		degToRad(60), // fieldOfView,
		aspect,
		1, // zNear
		2000, // zFar
	);

	const eye = [0, 2, 3];
	const target = [0, 1, 0];
	const up = [0, 1, 0];

	// Compute a view matrix
	const viewMatrix = mat4.lookAt(eye, target, up);

	// combine the view and projection matrixes
	const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);

	const offset = -15;
	objectNdx = 0;
	const ctx = { pass, viewProjectionMatrix };

	let draws = 0;
	for (let j = 0; j < r.scene.heigthmap.length; j++) {
		const row = r.scene.heigthmap[j];
		for (let i = 0; i < row.length; i++) {
			// const pos = [i - Math.floor(row.length / 2), row[i] - 15, -j - 10];
			// drawObject(ctx, mat4.translation(pos), [1, 1, 1, 1]);
			const pos = [i - Math.floor(row.length / 2), row[i], -j - 10];
			for (let k = pos[1]; k >= 0; k--) {
				drawObject(
					ctx,
					mat4.translation([pos[0], k + offset, pos[2]]),
					[1, 1, 1, 1],
				);
				draws++;
			}
		}
	}
	console.log("total objects", draws);
	pass.end();

	const commandBuffer = encoder.finish();
	console.timeEnd("encode");
	r.device.queue.submit([commandBuffer]);
}

async function setupPipeline(canvas: HTMLCanvasElement) {
	const dpr = devicePixelRatio;
	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	const context = canvas.getContext("webgpu");
	if (!context) {
		throw Error("failed to get canvas context");
	}
	const adapter = await navigator.gpu.requestAdapter();
	if (!adapter) {
		throw Error("failed to get adapter");
	}
	const device = await adapter.requestDevice();
	device.lost.then((info) => {
		console.error(`WebGPU device was lost: ${info.message}`);
		// 'reason' will be 'destroyed' if we intentionally destroy the device.
		if (info.reason !== "destroyed") {
			// try again
			setupPipeline(canvas);
		}
	});
	const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
	context.configure({
		device,
		format: presentationFormat,
		alphaMode: "premultiplied",
	});

	const module = device.createShaderModule({
		label: "our hardcoded red triangle shaders",
		code: tri,
	});

	const pipeline = device.createRenderPipeline({
		label: "2 attributes with color",
		layout: "auto",
		vertex: {
			module,
			buffers: [
				{
					arrayStride: 4 * 4, // (3) floats 4 bytes each + one 4 byte color
					attributes: [
						{ shaderLocation: 0, offset: 0, format: "float32x3" }, // position
						{ shaderLocation: 1, offset: 12, format: "unorm8x4" }, // color
					],
				},
			],
		},
		fragment: {
			module,
			targets: [{ format: presentationFormat }],
		},
		primitive: {
			cullMode: "back",
		},
		depthStencil: {
			depthWriteEnabled: true,
			depthCompare: "less",
			format: "depth24plus",
		},
	});

	const { vertexData, numVertices } = vertex.createCubeVertices();
	const vertexBuffer = device.createBuffer({
		label: "vertex buffer vertices",
		size: vertexData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
	});
	device.queue.writeBuffer(vertexBuffer, 0, vertexData);
	console.time("heightmap");
	const heigthmap = vertex.generateHeightmap();
	console.timeEnd("heightmap");
	const scene = { vertexBuffer, numVertices, heigthmap };

	// console.time("render");
	// render({
	// 	canvas,
	// 	device,
	// 	context,
	// 	pipeline,
	// 	scene,
	// });
	// console.timeEnd("render");

	const observer = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const canvas = entry.target as HTMLCanvasElement;
			const width = entry.contentBoxSize[0].inlineSize;
			const height = entry.contentBoxSize[0].blockSize;
			canvas.width = Math.max(
				1,
				Math.min(width, device.limits.maxTextureDimension2D),
			);
			canvas.height = Math.max(
				1,
				Math.min(height, device.limits.maxTextureDimension2D),
			);
			// re-render
			render({
				canvas,
				device,
				context,
				pipeline,
				scene,
			});
		}
	});
	observer.observe(canvas);
}

function createObjectInfo(device: GPUDevice, pipeline: GPURenderPipeline) {
	// matrix and color
	const uniformBufferSize = (16 + 4) * 4;
	const uniformBuffer = device.createBuffer({
		label: "uniforms",
		size: uniformBufferSize,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	const uniformValues = new Float32Array(uniformBufferSize / 4);

	// offsets to the various uniform values in float32 indices
	const kMatrixOffset = 0;
	const kColorOffset = 16;

	const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);
	const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);

	const bindGroup = device.createBindGroup({
		label: "bind group for object",
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: uniformBuffer }],
	});

	return {
		uniformBuffer,
		uniformValues,
		colorValue,
		matrixValue,
		bindGroup,
	};
}

const degToRad = (d: number) => (d * Math.PI) / 180;

export const voxel = {
	setupPipeline,
	startAnimationLoop,
	cleanupPipeline,
};
