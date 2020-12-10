class Boid {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.dx = Math.random() * 10 - 5;
    this.dy = Math.random() * 10 - 5;
    this.history = [];

    this.team = Math.random() > 0.5 ? 0 : 1;
  }
}

// Size of canvas. These get updated to fill the whole browser.
let paused = false
const DRAW_TRAIL = false;
let width = 150;
let height = 150;

const numBoids = 100;
const visualRange = 75;

let boids = [];
let teams = { fill: ["#558cf4", "#df2a2a"], stroke: ["#558cf466", "#E55454"] };

function initBoids() {
  for (let i = 0; i < numBoids; i++) {
    boids.push(new Boid());
  }
}

function distance(boid1, boid2) {
  let dx = Math.abs(boid2.x - boid1.x);
  let dy = Math.abs(boid2.y - boid1.y);

  if (dx > 0.5) dx = 1.0 - dx;

  if (dy > 0.5) dy = 1.0 - dy;

  return Math.sqrt(dx * dx + dy * dy);

  //TODO Wrapping
  return Math.sqrt(
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
    (boid1.y - boid2.y) * (boid1.y - boid2.y)
  );
}

// TODO: This is naive and inefficient.
function nClosestBoids(boid, n) {
  // Make a copy
  const sorted = boids.slice();
  // Sort the copy by distance from `boid`
  sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
  // Return the `n` closest
  return sorted.slice(1, n + 1);
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid) {
  const margin = 10;

  // if (boid.x < margin) boid.x = width - margin;

  // if (boid.x > width - margin) boid.x = margin;

  // if (boid.y < margin) boid.y = height - margin;

  // if (boid.y > height - margin) boid.y = margin;

  // return;

  const turnFactor = 1;

  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    boid.dx -= turnFactor;
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > height - margin) {
    boid.dy -= turnFactor;
  }
}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid) {
  const centeringFactor = 0.005; // adjust velocity by this %

  let centerX = 0;
  let centerY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
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

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
  const minDistance = 40; // The distance to stay away from other boids
  const avoidFactor = 0.05; // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  let moveX1 = 0;
  let moveY1 = 0;

  let sameTeamAvoid = avoidFactor;
  let otherTeamAvoid = avoidFactor * 2;

  let minDistance1 = minDistance;
  let minDistance2 = minDistance;

  for (let otherBoid of boids) {
    if (otherBoid !== boid) {
      const diff = otherBoid.team == boid.team;
      if (distance(boid, otherBoid) < (diff ? minDistance1 : minDistance2)) {
        moveX += (boid.x - otherBoid.x);
        moveY += (boid.y - otherBoid.y);
        moveX1 += (boid.x - otherBoid.x) * (diff ? sameTeamAvoid : otherTeamAvoid)
        moveY1 += (boid.y - otherBoid.y) * (diff ? sameTeamAvoid : otherTeamAvoid)
      }
    }
  }
  // if (moveX * avoidFactor !== moveX1) {
  //   console.error("KAPOET: ", moveX * avoidFactor, moveX1)
  // }
  boid.dx += moveX1;
  boid.dy += moveY1;
  // boid.dx += moveX * avoidFactor;
  // boid.dy += moveY * avoidFactor;
}

// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid) {
  const matchingFactor = 0.05; // Adjust by this % of average velocity

  let avgDX = 0;
  let avgDY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
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

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid) {
  const speedLimit = 10;

  const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

function drawBoid(ctx, boid) {
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

// Main animation loop
function animationLoop() {
  if (paused) {
    setTimeout(() => {

      window.requestAnimationFrame(animationLoop);
    }, 1000)
    return
  }
  // Update each boid
  for (let boid of boids) {
    // Update the velocities according to each rule
    flyTowardsCenter(boid);
    avoidOthers(boid);
    matchVelocity(boid);
    limitSpeed(boid);
    keepWithinBounds(boid);

    // Update the position based on the current velocity
    boid.x += boid.dx;
    boid.y += boid.dy;
    boid.history.push([boid.x, boid.y]);
    boid.history = boid.history.slice(-50);
  }

  // Clear the canvas and redraw all the boids in their current positions
  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let boid of boids) {
    drawBoid(ctx, boid);
  }

  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  // Randomly distribute the boids to start
  initBoids();

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);
};
