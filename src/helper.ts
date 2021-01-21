import { Boid } from "./boids";

type Coord = Boid | Vector2 | { x: number; y: number };

export function arrayPoint(point: Coord) {
	return { x: point[0], y: point[1] };
}
export interface Settings {
	numBoids: number; //Number of boids in sim
	visualRange: number; //Visual range of each individual boid

	minDistance: number; //Min distance between boids of own team. Is multiplied by 5 for other boids
	avoidFactor: number; //How to act between boids of own team. Is multiplied by 2 for other boids

	matchingFactor: number; //% of speed matching between boids
	centeringFactor: number; //% of centering in boid group

	pathDistCutoff: number;
	pathCenteringFactor: number;

	speedLimit: number; //Max speed for boids

	margin: number; //Margin of screen
	turnFactor: number; //How hard to avoid bounds

	stroke: boolean; //Draw lines of the boids history
	paused: boolean; //Pause the sim
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

	rotate(degrees: number): Vector2 {
		const theta = -degrees * (Math.PI / 180);
		const cos = Math.cos(theta);
		const sin = Math.sin(theta);

		const xTemp = this.x;
		this.x = Math.round(10000 * (this.x * cos - this.y * sin)) / 10000;
		this.y = Math.round(10000 * (xTemp * sin + this.y * cos)) / 10000;
		return this;
	}

	copy(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	length(): number {
		return Math.abs(this.x) + Math.abs(this.y);
	}
}

export function distance(boid1: Coord, boid2: Coord): number {
	let dx = Math.abs(boid2.x - boid1.x);
	let dy = Math.abs(boid2.y - boid1.y);

	if (dx > 0.5) dx = 1.0 - dx;

	if (dy > 0.5) dy = 1.0 - dy;

	return Math.sqrt(dx * dx + dy * dy);
}
