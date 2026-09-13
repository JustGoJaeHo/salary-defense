import Phaser from 'phaser'
import { PATH_WAYPOINTS } from './path'

const ENEMY_SPEED = 120
const ENEMY_HP = 30
const ENEMY_REWARD = 5

export class Enemy {
  readonly graphic: Phaser.GameObjects.Arc
  readonly reward = ENEMY_REWARD
  private waypointIndex = 1
  private hp = ENEMY_HP

  constructor(scene: Phaser.Scene) {
    const start = PATH_WAYPOINTS[0]
    this.graphic = scene.add.circle(start.x, start.y, 12, 0xe74c3c)
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
