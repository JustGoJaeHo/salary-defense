import Phaser from 'phaser'
import { Enemy } from './Enemy'

const PROJECTILE_SPEED = 400
const HIT_DISTANCE = 8

export class Projectile {
  readonly graphic: Phaser.GameObjects.Arc
  private readonly target: Enemy
  private readonly damage: number

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number) {
    this.graphic = scene.add.circle(x, y, 4, 0xf1c40f)
    this.target = target
    this.damage = damage
  }

  private get isSpent(): boolean {
    return this.target.isDead || this.target.isFinished
  }

  update(deltaSeconds: number): boolean {
    if (this.isSpent) return true

    const dx = this.target.graphic.x - this.graphic.x
    const dy = this.target.graphic.y - this.graphic.y
    const distance = Math.hypot(dx, dy)

    if (distance <= HIT_DISTANCE) {
      this.target.takeDamage(this.damage)
      return true
    }

    const step = PROJECTILE_SPEED * deltaSeconds
    this.graphic.x += (dx / distance) * step
    this.graphic.y += (dy / distance) * step
    return false
  }

  destroy(): void {
    this.graphic.destroy()
  }
}
