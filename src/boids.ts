import { distance, Vector2 } from "./helper";

export class Boid {
	pos: Vector2;
	vel: Vector2;

	x: number;
	y: number;
	dx: number;
	dy: number;

	history: Array<Vector2>;
	team: number;

	constructor() {
		this.x = Math.random() * 1000;
		this.y = Math.random() * 1000;
		this.dx = Math.random() * 10 - 5;
		this.dy = Math.random() * 10 - 5;
		this.history = [];

		this.team = Math.random() > 0.5 ? 0 : 1;
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
