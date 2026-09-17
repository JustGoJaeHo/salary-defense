import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { GAME_COLORS } from '../ui/theme'

const TOWER_RANGE = 140
const TOWER_DAMAGE = 10
const TOWER_FIRE_INTERVAL = 800
export const TOWER_COST = 50

export class Tower {
  readonly graphic: Phaser.GameObjects.Rectangle
  readonly damage = TOWER_DAMAGE
  private cooldown = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.graphic = scene.add.rectangle(x, y, 28, 28, GAME_COLORS.tower)
  }

  update(deltaMs: number, enemies: Enemy[]): Enemy | null {
    this.cooldown -= deltaMs
    if (this.cooldown > 0) return null

    const target = this.findTarget(enemies)
    if (!target) return null

    this.cooldown = TOWER_FIRE_INTERVAL
    return target
  }

  private findTarget(enemies: Enemy[]): Enemy | null {
    for (const enemy of enemies) {
      const dx = enemy.graphic.x - this.graphic.x
      const dy = enemy.graphic.y - this.graphic.y
      if (Math.hypot(dx, dy) <= TOWER_RANGE) {
        return enemy
      }
    }
    return null
  }
}
