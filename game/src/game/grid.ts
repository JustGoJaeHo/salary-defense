import type { Point } from './path'

export const GRID_SIZE = 40

export function snapToGrid(x: number, y: number): Point {
  const col = Math.floor(x / GRID_SIZE)
  const row = Math.floor(y / GRID_SIZE)
  return {
    x: col * GRID_SIZE + GRID_SIZE / 2,
    y: row * GRID_SIZE + GRID_SIZE / 2,
  }
}

export function distanceToPath(x: number, y: number, path: Point[]): number {
  let minDistance = Infinity
  for (let i = 0; i < path.length - 1; i++) {
    const distance = distanceToSegment(x, y, path[i], path[i + 1])
    minDistance = Math.min(minDistance, distance)
  }
  return minDistance
}

function distanceToSegment(x: number, y: number, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return Math.hypot(x - a.x, y - a.y)
  }

  let t = ((x - a.x) * dx + (y - a.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const closestX = a.x + t * dx
  const closestY = a.y + t * dy
  return Math.hypot(x - closestX, y - closestY)
}
