import { distance, Vector2 } from "./helper";

export class Boid {
	target: number = 0;

	x: number;
	y: number;
	dx: number;
	dy: number;

	history: Array<Vector2>;
	team: number = 0;

	constructor(width, height) {
		this.team = Math.random() > 0.5 ? 1 : 2;
		// this.team = 1;

		this.x = this.team === 1 ? width : 0;
		this.y = height / 2;
		this.dx = Math.random() * 10 - 5;
		this.dy = Math.random() * 10 - 5;
		this.history = [];
	}

	// Speed will naturally vary in flocking behavior, but real animals can't go
	// arbitrarily fast.
	limitSpeed(speedLimit) {
		const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		if (speed > speedLimit) {
			this.dx = (this.dx / speed) * speedLimit;
			this.dy = (this.dy / speed) * speedLimit;
		}
	}
}
