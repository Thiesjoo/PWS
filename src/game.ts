import { Display } from "./display";
import { distance, Vector2, Settings } from "./helper";
import { Boid } from "./boids";

export class Game {
	display: Display;
	boids: Array<Boid> = [];

	settings: Settings;

	constructor(display: Display, _settings: Settings) {
		this.settings = _settings;

		this.display = display;
		// Randomly distribute the boids to start
		this.initBoids();
	}

	initBoids() {
		this.boids = [];
		for (let i = 0; i < this.settings.numBoids; i++) {
			this.boids.push(new Boid());
		}
	}

	// Constrain a boid to within the window. If it gets too close to an edge,
	// nudge it back in and reverse its direction.
	keepWithinBounds(boid: Boid) {
		if (boid.x < this.settings.margin) {
			boid.dx += this.settings.turnFactor;
		}
		if (boid.x > this.display.width - this.settings.margin) {
			boid.dx -= this.settings.turnFactor;
		}
		if (boid.y < this.settings.margin) {
			boid.dy += this.settings.turnFactor;
		}
		if (boid.y > this.display.height - this.settings.margin) {
			boid.dy -= this.settings.turnFactor;
		}
	}

	// TODO: This is naive and inefficient.
	nClosestBoids(boid: Boid, n: number): Array<Boid> {
		// Make a copy
		const sorted = this.boids.slice();
		// Sort the copy by distance from `boid`
		sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
		// Return the `n` closest
		return sorted.slice(1, n + 1);
	}

	// Find the center of mass of the other boids and adjust velocity slightly to
	// point towards the center of mass.
	flyTowardsCenter(boid: Boid) {
		let centerX = 0;
		let centerY = 0;
		let numNeighbors = 0;

		for (let otherBoid of this.boids) {
			if (
				boid.team == otherBoid.team &&
				distance(boid, otherBoid) < this.settings.visualRange
			) {
				centerX += otherBoid.x;
				centerY += otherBoid.y;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			centerX = centerX / numNeighbors;
			centerY = centerY / numNeighbors;

			boid.dx += (centerX - boid.x) * this.settings.centeringFactor;
			boid.dy += (centerY - boid.y) * this.settings.centeringFactor;
		}
	}

	headToTarget(boid: Boid, bounds: Array<Vector2> = []) {
		if (bounds.length > 0) {
			let currDist = distance(boid, bounds[boid.target]);

			if (currDist < this.settings.pathDistCutoff) {
				boid.target += boid.team % 2 == 0 ? 1 : -1;
			}
			if (boid.target > bounds.length - 1) boid.target = 0;
			if (boid.target < 0) boid.target = bounds.length - 1;

			boid.dx +=
				(bounds[boid.target].x - boid.x) * this.settings.pathCenteringFactor;
			boid.dy +=
				(bounds[boid.target].y - boid.y) * this.settings.pathCenteringFactor;
		}
	}

	// Find the average velocity (speed and direction) of the other boids and
	// adjust velocity slightly to match.
	matchVelocity(boid: Boid) {
		let avgDX = 0;
		let avgDY = 0;
		let numNeighbors = 0;

		for (let otherBoid of this.boids) {
			if (
				otherBoid.team === boid.team &&
				distance(boid, otherBoid) < this.settings.visualRange
			) {
				avgDX += otherBoid.dx;
				avgDY += otherBoid.dy;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			avgDX = avgDX / numNeighbors;
			avgDY = avgDY / numNeighbors;

			boid.dx += (avgDX - boid.dx) * this.settings.matchingFactor;
			boid.dy += (avgDY - boid.dy) * this.settings.matchingFactor;
		}
	}

	// Move away from other boids that are too close to avoid colliding
	avoidOthers(boid: Boid) {
		let moveX1 = 0;
		let moveY1 = 0;

		let sameTeamAvoid = this.settings.avoidFactor;
		let otherTeamAvoid = this.settings.avoidFactor * 2;

		let minTeamDist = this.settings.minDistance;
		let minOtherDist = this.settings.minDistance * 2;

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

	updateBoids(points: Array<Vector2>) {
		// Update each boid
		for (let boid of this.boids) {
			// Update the velocities according to each rule
			this.headToTarget(boid, points);
			this.flyTowardsCenter(boid);
			this.avoidOthers(boid);
			this.keepWithinBounds(boid);
			this.matchVelocity(boid);
			boid.limitSpeed(this.settings.speedLimit);

			// Update the position based on the current velocity
			boid.x += boid.dx;
			boid.y += boid.dy;
			boid.history.push(new Vector2(boid.x, boid.y));
			boid.history = boid.history.slice(-50);
		}
	}
}
