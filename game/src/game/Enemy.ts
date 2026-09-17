import Phaser from 'phaser'
import { PATH_WAYPOINTS } from './path'
import { GAME_COLORS } from '../ui/theme'

const ENEMY_SPEED = 80
const ENEMY_HP = 30
const ENEMY_REWARD = 5

export class Enemy {
  readonly graphic: Phaser.GameObjects.Arc
  readonly reward = ENEMY_REWARD
  private waypointIndex = 1
  private hp = ENEMY_HP

  constructor(scene: Phaser.Scene) {
    const start = PATH_WAYPOINTS[0]
    this.graphic = scene.add.circle(start.x, start.y, 12, GAME_COLORS.enemy)
  }

  get isFinished(): boolean {
    return this.waypointIndex >= PATH_WAYPOINTS.length
  }

  get isDead(): boolean {
    return this.hp <= 0
  }

  takeDamage(amount: number): void {
    this.hp -= amount
  }

  /** 현재 위치에서 경로 끝까지 남은 거리. 모든 적의 속도가 같으므로 이 값이 작을수록 먼저 도착한다. */
  remainingDistanceToEnd(): number {
    let distance = Math.hypot(
      PATH_WAYPOINTS[this.waypointIndex].x - this.graphic.x,
      PATH_WAYPOINTS[this.waypointIndex].y - this.graphic.y,
    )
    for (let i = this.waypointIndex; i < PATH_WAYPOINTS.length - 1; i++) {
      distance += Math.hypot(
        PATH_WAYPOINTS[i + 1].x - PATH_WAYPOINTS[i].x,
        PATH_WAYPOINTS[i + 1].y - PATH_WAYPOINTS[i].y,
      )
    }
    return distance
  }

  update(deltaSeconds: number): void {
    if (this.isFinished || this.isDead) return

    const target = PATH_WAYPOINTS[this.waypointIndex]
    const dx = target.x - this.graphic.x
    const dy = target.y - this.graphic.y
    const distance = Math.hypot(dx, dy)
    const step = ENEMY_SPEED * deltaSeconds

    if (step >= distance) {
      this.graphic.setPosition(target.x, target.y)
      this.waypointIndex += 1
    } else {
      this.graphic.x += (dx / distance) * step
      this.graphic.y += (dy / distance) * step
    }
  }

  destroy(): void {
    this.graphic.destroy()
  }
}
