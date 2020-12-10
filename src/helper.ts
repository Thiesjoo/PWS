import { Boid } from "./boids";

export function arrayPoint(point) {
	return { x: point[0], y: point[1] };
}
export class Vector2 {
	x: number;
	y: number;

	constructor(_x, _y) {
		this.x = _x;
		this.y = _y;
	}
}

export function distance(boid1: Boid | Vector2, boid2: Boid | Vector2): number {
	let dx = Math.abs(boid2.x - boid1.x);
	let dy = Math.abs(boid2.y - boid1.y);

	if (dx > 0.5) dx = 1.0 - dx;

	if (dy > 0.5) dy = 1.0 - dy;

	return Math.sqrt(dx * dx + dy * dy);
}
