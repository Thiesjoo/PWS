import { Game } from "./game";
import { arrayPoint, distance } from "./helper";

// Size of canvas. These get updated to fill the whole browser.
let paused = false;
const DRAW_TRAIL = false;

//Colors
let teams = { fill: ["#558cf4", "#df2a2a"], stroke: ["#558cf466", "#E55454"] };

export class Display {
	width: number = 150;
	height: number = 150;

	canvas: HTMLCanvasElement;
	game: Game;

	constructor() {
		this.canvas = <HTMLCanvasElement>document.getElementById("boids");
		this.game = new Game(this);

		this.animationLoop = this.animationLoop.bind(this);
		this.sizeCanvas = this.sizeCanvas.bind(this);

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

	drawBoid(ctx, boid) {
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

		if (DRAW_TRAIL) {
			ctx.strokeStyle = teams.stroke[boid.team];
			ctx.beginPath();
			ctx.moveTo(boid.history[0][0], boid.history[0][1]);

			for (let i = 1; i < boid.history.length; i++) {
				const point = boid.history[i];
				if (distance(arrayPoint(point), arrayPoint(boid.history[i - 1])) > 10) {
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(point[0], point[1]);
				}
				ctx.lineTo(point[0], point[1]);
			}

			ctx.stroke();
		}
	}
}
