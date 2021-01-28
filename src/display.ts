import { Game } from "./game";
import { arrayPoint, distance, Vector2, Settings } from "./helper";

import * as dat from "dat.gui";
import { Boid } from "./boids";

//Colors
let teams = { fill: ["#558cf4", "#df2a2a"], stroke: ["#558cf466", "#E55454"] };
export class Display {
	width: number = 150;
	height: number = 150;

	canvas: HTMLCanvasElement;
	game: Game;

	gui: dat.GUI;
	gameSettings: Settings;
	recordSettings: { time: number; record: () => void };

	tempPath: Array<Vector2> = [];
	lastCallTime: number;
	fps: number = 0;

	constructor() {
		this.canvas = <HTMLCanvasElement>document.getElementById("boids");

		this.gameSettings = {
			numBoids: 300,
			visualRange: 200,
			minDistance: 50,
			avoidFactor: 0.01,
			matchingFactor: 0.01,
			speedLimit: 5,
			centeringFactor: 0,
			turnFactor: 0.1,
			margin: 50,
			pathCenteringFactor: 0.0001,
			pathDistCutoff: 100,
			stroke: false,
			paused: false,
		};

		this.recordSettings = {
			time: 3,
			record: () => {
				let chunks = []; // here we will store our recorded media chunks (Blobs)
				let stream: MediaStream = (this.canvas as any).captureStream(60); // grab our canvas MediaStream
				const rec = new MediaRecorder(stream); // init the recorder
				// every time the recorder has new data, we will store it in our array
				rec.ondataavailable = (e) => chunks.push(e.data);
				// only when the recorder stops, we construct a complete Blob from all the chunks
				rec.onstop = (e) => {
					exportVid(new Blob(chunks, { type: "video/mp4" }));
					chunks = [];
					stream = null;
				};

				rec.start();
				console.log("Started recording");
				setTimeout(() => rec.stop(), this.recordSettings.time * 1000); // stop recording in 3s

				function exportVid(blob) {
					console.log("exporting");
					const vid = document.createElement("video");
					vid.src = URL.createObjectURL(blob);
					vid.controls = true;
					document.body.appendChild(vid);
					const a = document.createElement("a");
					const currDate = new Date();
					a.download = `${currDate.getHours()}:${currDate.getMinutes()} ${currDate.getDate()}-${
						currDate.getMonth() + 1
					}`;
					a.href = vid.src;
					document.body.appendChild(a);
					a.click();
					a.remove();
					vid.remove();
					stream.getTracks().forEach((element) => {
						element.stop();
					});
				}
			},
		};

		this.game = new Game(this, this.gameSettings);

		this.click = this.click.bind(this);
		this.animationLoop = this.animationLoop.bind(this);
		this.sizeCanvas = this.sizeCanvas.bind(this);

		this.init();

		window.onload = () => {
			// Make sure the canvas always fills the whole window
			window.addEventListener("resize", this.sizeCanvas, false);
			this.canvas.addEventListener("click", this.click);
			this.sizeCanvas();
			this.canvas.getContext("2d").font = "30px Arial";

			window.requestAnimationFrame(this.animationLoop);
		};
	}

	init() {
		const settingsChanged = () => {
			this.game.settings = this.gameSettings;
			if (this.game.boids.length !== this.gameSettings.numBoids) {
				this.game.initBoids();
			}
		};
		this.gui?.destroy();
		// Creating a GUI and a subfolder.
		this.gui = new dat.GUI();
		const simSettings = this.gui.addFolder("Sim Settings");
		const boidSettings = this.gui.addFolder("Boid Settings");
		const pathSettings = this.gui.addFolder("Path Settings");
		const visualSettings = this.gui.addFolder("Visual Settings");

		simSettings
			.add(this.gameSettings, "numBoids", 0, 500, 1)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "visualRange", 0, 2000, 25)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "speedLimit", 0, 50, 1)
			.onFinishChange(settingsChanged);

		boidSettings
			.add(this.gameSettings, "minDistance", 1, 200, 1)
			.onFinishChange(settingsChanged);
		boidSettings
			.add(this.gameSettings, "avoidFactor", 0, 0.2, 0.0001)
			.onFinishChange(settingsChanged);
		boidSettings
			.add(this.gameSettings, "matchingFactor", 0, 0.2, 0.01)
			.onFinishChange(settingsChanged);
		boidSettings
			.add(this.gameSettings, "turnFactor", 0, 5, 0.25)
			.onFinishChange(settingsChanged);
		boidSettings
			.add(this.gameSettings, "centeringFactor", 0, 0.5, 0.0001)
			.onFinishChange(settingsChanged);

		pathSettings
			.add(this.gameSettings, "pathDistCutoff", 0, 100, 1)
			.onFinishChange(settingsChanged);
		pathSettings
			.add(this.gameSettings, "pathCenteringFactor", 0, 0.1, 0.0001)
			.onFinishChange(settingsChanged);

		visualSettings
			.add(this.gameSettings, "stroke", 0, 1, 1)
			.onFinishChange(settingsChanged);
		visualSettings
			.add(this.gameSettings, "paused", 0, 1, 1)
			.onFinishChange(settingsChanged);
		visualSettings
			.add(this.gameSettings, "margin", 0, 100, 10)
			.onFinishChange(settingsChanged);

		visualSettings.add(this.recordSettings, "time", 1, 30, 1);
		visualSettings.add(this.recordSettings, "record");
	}

	// Called initially and whenever the window resizes to update the canvas
	// size and width/height variables.
	sizeCanvas() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	click(ev: MouseEvent) {
		const { clientX: x, clientY: y } = ev;
		this.tempPath.push(new Vector2(x, y));
	}

	// Main animation loop
	animationLoop() {
		if (this.game.settings.paused) {
			setTimeout(() => {
				window.requestAnimationFrame(this.animationLoop);
			}, 1000);
			return;
		} else if (!this.lastCallTime) {
			this.lastCallTime = performance.now();
			this.fps = 0;
		}

		//Calc fps
		let delta = (performance.now() - this.lastCallTime) / 1000;
		this.lastCallTime = performance.now();
		this.fps = Math.round(1 / delta);

		this.game.updateBoids([...this.tempPath]);
		this.game.updateBoids([...this.tempPath]);

		// Clear the canvas and redraw all the boids in their current positions
		const ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.fillText(`FPS: ${this.fps}`, 10, 30);
		ctx.fillText(
			`AvgSpeed: ${
				Math.round(
					(this.game.boids.reduce((acc, val) => {
						acc += Math.sqrt(val.dx ** 2 + val.dy ** 2);
						return acc;
					}, 0) /
						this.game.boids.length +
						Number.EPSILON) *
						100
				) / 100
			}`,
			10,
			60
		);

		//Draw path and boids
		this.drawPath(ctx);
		for (let boid of this.game.boids) {
			this.drawBoid(ctx, boid);
		}

		// Schedule the next frame
		window.requestAnimationFrame(this.animationLoop);
	}

	drawPath(ctx: CanvasRenderingContext2D) {
		if (this.tempPath.length < 2) return;
		const multiplier = 10;
		const points: Array<Vector2> = this.tempPath;

		ctx.beginPath();
		// move to the first point
		ctx.moveTo(points[0].x, points[0].y);

		for (let i = 1; i < points.length - 1; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		let last1 = points[points.length - 1];

		// curve through the last two points
		ctx.lineTo(last1.x, last1.y);
		ctx.stroke();
	}

	drawBoid(ctx: CanvasRenderingContext2D, boid: Boid) {
		const angle = Math.atan2(boid.dy, boid.dx);
		ctx.translate(boid.x, boid.y);
		ctx.rotate(angle);
		ctx.translate(-boid.x, -boid.y);
		ctx.fillStyle = teams.fill[boid.team % teams.fill.length];
		ctx.beginPath();
		ctx.moveTo(boid.x, boid.y);
		ctx.lineTo(boid.x - 15, boid.y + 5);
		ctx.lineTo(boid.x - 15, boid.y - 5);
		ctx.lineTo(boid.x, boid.y);
		ctx.fill();
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		if (this.gameSettings.stroke) {
			ctx.strokeStyle = teams.stroke[boid.team];
			ctx.beginPath();
			ctx.moveTo(boid.history[0].x, boid.history[0].y);

			for (let i = 1; i < boid.history.length; i++) {
				const point: Vector2 = boid.history[i];
				if (distance(arrayPoint(point), arrayPoint(boid.history[i - 1])) > 10) {
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(point.x, point.y);
				}
				ctx.lineTo(point.x, point.y);
			}

			ctx.stroke();
		}
	}
}
