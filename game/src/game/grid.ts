import type { Point } from './path'

// 현재 필드 영역(가로 540px, 세로 850px) 기준으로 가로 10칸 x 세로 16칸이 나오도록 역산한 값이다.
export const GRID_SIZE = 53

/** offsetX/offsetY는 플레이 필드의 좌측(fieldLeft)/상단(fieldTop)에 격자를 맞추기 위한 값이다. */
export function snapToGrid(x: number, y: number, offsetX = 0, offsetY = 0): Point {
  const col = Math.floor((x - offsetX) / GRID_SIZE)
  const row = Math.floor((y - offsetY) / GRID_SIZE)
  return {
    x: offsetX + col * GRID_SIZE + GRID_SIZE / 2,
    y: offsetY + row * GRID_SIZE + GRID_SIZE / 2,
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
