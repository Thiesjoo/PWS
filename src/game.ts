import { Display } from "./display";
import { distance, Vector2 } from "./helper";
import { Boid } from "./boids";

const numBoids = 200;
const visualRange = 75;

//Avoidance
const minDistance = 20; // The distance to stay away from other boids
const avoidFactor = 0.05; // Adjust velocity by this %

//Speed
const matchingFactor = 0.05; // Adjust by this % of average velocity

export class Game {
	display: Display;
	boids: Array<Boid> = [];

	constructor(display: Display) {
		this.display = display;
		// Randomly distribute the boids to start
		for (let i = 0; i < numBoids; i++) {
			this.boids.push(new Boid());
		}
	}

	// Constrain a boid to within the window. If it gets too close to an edge,
	// nudge it back in and reverse its direction.
	keepWithinBounds(boid) {
		const margin = 10;
		const turnFactor = 1;

		if (boid.x < margin) {
			boid.dx += turnFactor;
		}
		if (boid.x > this.display.width - margin) {
			boid.dx -= turnFactor;
		}
		if (boid.y < margin) {
			boid.dy += turnFactor;
		}
		if (boid.y > this.display.height - margin) {
			boid.dy -= turnFactor;
		}
	}

	// TODO: This is naive and inefficient.
	nClosestBoids(boid, n) {
		// Make a copy
		const sorted = this.boids.slice();
		// Sort the copy by distance from `boid`
		sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
		// Return the `n` closest
		return sorted.slice(1, n + 1);
	}

	// Find the center of mass of the other boids and adjust velocity slightly to
	// point towards the center of mass.
	flyTowardsCenter(boid) {
		const centeringFactor = 0.005; // adjust velocity by this %

		let centerX = 0;
		let centerY = 0;
		let numNeighbors = 0;

		for (let otherBoid of this.boids) {
			if (
				distance(boid, otherBoid) < visualRange &&
				boid.team == otherBoid.team
			) {
				centerX += otherBoid.x;
				centerY += otherBoid.y;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			centerX = centerX / numNeighbors;
			centerY = centerY / numNeighbors;

			boid.dx += (centerX - boid.x) * centeringFactor;
			boid.dy += (centerY - boid.y) * centeringFactor;
		}
	}

	// Find the average velocity (speed and direction) of the other boids and
	// adjust velocity slightly to match.
	matchVelocity(boid) {
		let avgDX = 0;
		let avgDY = 0;
		let numNeighbors = 0;

		for (let otherBoid of this.boids) {
			if (distance(boid, otherBoid) < visualRange) {
				avgDX += otherBoid.dx;
				avgDY += otherBoid.dy;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			avgDX = avgDX / numNeighbors;
			avgDY = avgDY / numNeighbors;

			boid.dx += (avgDX - boid.dx) * matchingFactor;
			boid.dy += (avgDY - boid.dy) * matchingFactor;
		}
	}

	// Move away from other boids that are too close to avoid colliding
	avoidOthers(boid) {
		let moveX1 = 0;
		let moveY1 = 0;

		let sameTeamAvoid = avoidFactor;
		let otherTeamAvoid = avoidFactor * 2;

		let minTeamDist = minDistance;
		let minOtherDist = minDistance * 5;

		for (let otherBoid of this.boids) {
			if (otherBoid !== boid) {
				const diff = otherBoid.team == boid.team;
				if (distance(boid, otherBoid) < (diff ? minTeamDist : minOtherDist)) {
					moveX1 +=
						(boid.x - otherBoid.x) * (diff ? sameTeamAvoid : otherTeamAvoid);
					moveY1 +=
						(boid.y - otherBoid.y) * (diff ? sameTeamAvoid : otherTeamAvoid);
				}
			}
		}

		boid.dx += moveX1;
		boid.dy += moveY1;
	}

	updateBoids() {
		// Update each boid
		for (let boid of this.boids) {
			// Update the velocities according to each rule
			this.flyTowardsCenter(boid);
			this.avoidOthers(boid);
			this.keepWithinBounds(boid);
			this.matchVelocity(boid);
			boid.limitSpeed();

			// Update the position based on the current velocity
			boid.x += boid.dx;
			boid.y += boid.dy;
			boid.history.push(new Vector2(boid.x, boid.y));
			boid.history = boid.history.slice(-50);
		}
	}
}
