import { Boid } from "./boids";

type Coord = Boid | Vector2 | { x: number; y: number };

export function arrayPoint(point: Coord) {
	return { x: point[0], y: point[1] };
}
export class Vector2 {
	x: number;
	y: number;

	constructor(_x, _y) {
		this.x = _x;
		this.y = _y;
	}

	add(vec: Vector2 | number): Vector2 {
		this.x += typeof vec === "number" ? vec : vec.x;
		this.y += typeof vec === "number" ? vec : vec.y;
		return this;
	}

	mult(vec: Vector2 | number): Vector2 {
		this.x *= typeof vec === "number" ? vec : vec.x;
		this.y *= typeof vec === "number" ? vec : vec.y;
		return this;
	}
}

export function distance(boid1: Coord, boid2: Coord): number {
	let dx = Math.abs(boid2.x - boid1.x);
	let dy = Math.abs(boid2.y - boid1.y);

	if (dx > 0.5) dx = 1.0 - dx;

	if (dy > 0.5) dy = 1.0 - dy;

	return Math.sqrt(dx * dx + dy * dy);
}
