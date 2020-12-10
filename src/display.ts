import { Game, Settings } from "./game";
import { arrayPoint, distance, Vector2 } from "./helper";

import * as dat from "dat.gui";
import { Boid } from "./boids";

// const numBoids = 200;
// const visualRange = 75;

// //Avoidance
// const minDistance = 20; // The distance to stay away from other boids
// const avoidFactor = 0.05; // Adjust velocity by this %

// //Speed
// const matchingFactor = 0.05; // Adjust by this % of average velocity

// Size of canvas. These get updated to fill the whole browser.
let paused = false;

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
			visualRange: 75,
			minDistance: 20,
			avoidFactor: 0.05,
			matchingFactor: 0.05,
			speedLimit: 5,
			stroke: false,
		};

		this.game = new Game(this, this.gameSettings);

		this.animationLoop = this.animationLoop.bind(this);
		this.sizeCanvas = this.sizeCanvas.bind(this);

		const settingsChanged = () => {
			this.game.settings = this.gameSettings;
			if (this.game.boids.length !== this.gameSettings.numBoids) {
				this.game.initBoids();
			}
		};

		// Creating a GUI and a subfolder.
		this.gui = new dat.GUI();
		var folder1 = this.gui.addFolder("Settings");

		folder1
			.add(this.gameSettings, "numBoids", 0, 500, 50)
			.onFinishChange(settingsChanged);
		folder1
			.add(this.gameSettings, "visualRange", 0, 2000, 25)
			.onFinishChange(settingsChanged);
		folder1
			.add(this.gameSettings, "minDistance", 1, 200, 1)
			.onFinishChange(settingsChanged);
		folder1
			.add(this.gameSettings, "avoidFactor", 0, 0.2, 0.01)
			.onFinishChange(settingsChanged);
		folder1
			.add(this.gameSettings, "matchingFactor", 0, 0.2, 0.01)
			.onFinishChange(settingsChanged);
		folder1
			.add(this.gameSettings, "speedLimit", 0, 50, 1)
			.onFinishChange(settingsChanged);
		folder1
			.add(this.gameSettings, "stroke", 0, 1, 1)
			.onFinishChange(settingsChanged);

		window.onload = () => {
			// Make sure the canvas always fills the whole window
			window.addEventListener("resize", this.sizeCanvas, false);
			this.sizeCanvas();

			window.requestAnimationFrame(this.animationLoop);
		};
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
		if (paused) {
			setTimeout(() => {
				window.requestAnimationFrame(this.animationLoop);
			}, 1000);
			return;
		}
		this.game.updateBoids();

		// Clear the canvas and redraw all the boids in their current positions
		const ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, this.width, this.height);
		for (let boid of this.game.boids) {
			this.drawBoid(ctx, boid);
		}

		// Schedule the next frame
		window.requestAnimationFrame(this.animationLoop);
	}

	drawBoid(ctx, boid: Boid) {
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
