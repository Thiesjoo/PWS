import { Game, Settings } from "./game";
import { arrayPoint, distance, Vector2 } from "./helper";

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

	constructor() {
		this.canvas = <HTMLCanvasElement>document.getElementById("boids");

		this.gameSettings = {
			numBoids: 200,
			visualRange: 200,
			minDistance: 75,
			avoidFactor: 0.002,
			matchingFactor: 0.05,
			speedLimit: 5,
			centeringFactor: 0.0001,
			turnFactor: 0.1,
			margin: 50,
			stroke: false,
			paused: false,
		};

		this.game = new Game(this, this.gameSettings);

		this.animationLoop = this.animationLoop.bind(this);
		this.sizeCanvas = this.sizeCanvas.bind(this);

		this.init();

		window.onload = () => {
			// Make sure the canvas always fills the whole window
			window.addEventListener("resize", this.sizeCanvas, false);
			this.sizeCanvas();

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
		const simSettings = this.gui.addFolder("SimSettings");
		const visualSettings = this.gui.addFolder("VisualSettings");

		simSettings
			.add(this.gameSettings, "numBoids", 0, 500, 50)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "visualRange", 0, 2000, 25)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "minDistance", 1, 200, 1)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "avoidFactor", 0, 0.2, 0.001)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "matchingFactor", 0, 0.2, 0.01)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "speedLimit", 0, 50, 1)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "turnFactor", 0, 5, 0.25)
			.onFinishChange(settingsChanged);
		simSettings
			.add(this.gameSettings, "centeringFactor", 0, 0.5, 0.0001)
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
	}

	// Called initially and whenever the window resizes to update the canvas
	// size and width/height variables.
	sizeCanvas() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	// Main animation loop
	animationLoop() {
		if (this.game.settings.paused) {
			setTimeout(() => {
				window.requestAnimationFrame(this.animationLoop);
			}, 1000);
			return;
		}
		this.game.updateBoids();

		// Clear the canvas and redraw all the boids in their current positions
		const ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, this.width, this.height);
		this.drawPath(ctx);
		for (let boid of this.game.boids) {
			this.drawBoid(ctx, boid);
		}

		// Schedule the next frame
		window.requestAnimationFrame(this.animationLoop);
	}

	drawPath(ctx: CanvasRenderingContext2D) {
		const multiplier = 10;
		const points: Array<Vector2> = [
			new Vector2(0, 0).mult(multiplier),
			new Vector2(100, 0).mult(multiplier),
			new Vector2(100, 100).mult(multiplier),

			new Vector2(0, 100).mult(multiplier),
			new Vector2(0, 0).mult(multiplier),

			// new Vector2(13, 10).mult(multiplier),
			// new Vector2(35, 10).mult(multiplier),
		];

		ctx.beginPath();
		// move to the first point
		ctx.moveTo(points[0].x, points[0].y);

		for (let i = 1; i < points.length - 2; i++) {
			var xc = (points[i].x + points[i + 1].x) / 2;
			var yc = (points[i].y + points[i + 1].y) / 2;
			ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
		}
		let last2 = points[points.length - 2];
		let last1 = points[points.length - 2];

		// curve through the last two points
		ctx.quadraticCurveTo(last2.x, last2.y, last1.x, last2.y);
		ctx.stroke();
	}

	drawBoid(ctx: CanvasRenderingContext2D, boid: Boid) {
		const angle = Math.atan2(boid.dy, boid.dx);
		ctx.translate(boid.x, boid.y);
		ctx.rotate(angle);
		ctx.translate(-boid.x, -boid.y);
		ctx.fillStyle = teams.fill[boid.team];
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
