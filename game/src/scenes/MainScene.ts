import Phaser from 'phaser'
import { PATH_WAYPOINTS, type Point } from '../game/path'
import { WAVES } from '../game/waves'
import { Enemy } from '../game/Enemy'
import { Tower, TOWER_COST } from '../game/Tower'
import { Projectile } from '../game/Projectile'
import { snapToGrid, distanceToPath } from '../game/grid'
import { submitGameResult } from '../api/gameResults'

const PLAYER_LIVES = 10
const STARTING_GOLD = 100
const PATH_CLEARANCE = 30

export class MainScene extends Phaser.Scene {
  private enemies: Enemy[] = []
  private towers: Tower[] = []
  private projectiles: Projectile[] = []
  private waveIndex = 0
  private lives = PLAYER_LIVES
  private gold = STARTING_GOLD
  private wavesCompleted = false
  private gameOver = false

  private livesText!: Phaser.GameObjects.Text
  private goldText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text

  create(): void {
    this.cameras.main.setBackgroundColor('#1d2230')
    this.drawPath()
    this.createHud()
    this.startWave(this.waveIndex)

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) return
      if (this.gold < TOWER_COST) return

      const cell = snapToGrid(pointer.x, pointer.y)
      if (distanceToPath(cell.x, cell.y, PATH_WAYPOINTS) < PATH_CLEARANCE) return
      if (this.isCellOccupied(cell)) return

      this.gold -= TOWER_COST
      this.towers.push(new Tower(this, cell.x, cell.y))
      this.refreshHud()
    })
  }

  update(_time: number, deltaMs: number): void {
    if (this.gameOver) return

    const deltaSeconds = deltaMs / 1000

    this.updateEnemies(deltaSeconds)
    if (this.gameOver) return

    this.updateTowers(deltaMs)
    this.updateProjectiles(deltaSeconds)
  }

  private createHud(): void {
    this.livesText = this.add.text(16, 16, '', { fontSize: '20px', color: '#ffffff' })
    this.goldText = this.add.text(16, 44, '', { fontSize: '20px', color: '#ffffff' })
    this.waveText = this.add.text(16, 72, '', { fontSize: '20px', color: '#ffffff' })
    this.refreshHud()
  }

  private refreshHud(): void {
    this.livesText.setText(`Lives: ${this.lives}`)
    this.goldText.setText(`Gold: ${this.gold}`)
    const currentWave = Math.min(this.waveIndex + 1, WAVES.length)
    this.waveText.setText(`Wave: ${currentWave}/${WAVES.length}`)
  }

  private updateEnemies(deltaSeconds: number): void {
    for (const enemy of this.enemies) {
      enemy.update(deltaSeconds)
    }

    const removed = this.enemies.filter((enemy) => enemy.isFinished || enemy.isDead)
    for (const enemy of removed) {
      if (enemy.isFinished) {
        this.lives -= 1
      } else if (enemy.isDead) {
        this.gold += enemy.reward
      }
      enemy.destroy()
    }
    this.enemies = this.enemies.filter((enemy) => !enemy.isFinished && !enemy.isDead)

    this.refreshHud()
    this.checkGameOver()
  }

  private checkGameOver(): void {
    if (this.lives <= 0) {
      this.endGame('GAME OVER')
      return
    }

    if (this.wavesCompleted && this.enemies.length === 0) {
      this.endGame('VICTORY')
    }
  }

  private endGame(message: string): void {
    this.gameOver = true
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, message, {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const cleared = message === 'VICTORY'
    const waveReached = Math.min(this.waveIndex + 1, WAVES.length)
    const nickname = window.prompt('닉네임을 입력하세요', 'Guest')?.trim() || 'Guest'

    submitGameResult({ nickname, cleared, waveReached }).catch((error) => {
      console.error('Failed to submit game result', error)
    })
  }

  private isCellOccupied(cell: Point): boolean {
    return this.towers.some((tower) => tower.graphic.x === cell.x && tower.graphic.y === cell.y)
  }

  private updateTowers(deltaMs: number): void {
    for (const tower of this.towers) {
      const target = tower.update(deltaMs, this.enemies)
      if (target) {
        this.projectiles.push(
          new Projectile(this, tower.graphic.x, tower.graphic.y, target, tower.damage),
        )
      }
    }
  }

  private updateProjectiles(deltaSeconds: number): void {
    const remaining: Projectile[] = []
    for (const projectile of this.projectiles) {
      const spent = projectile.update(deltaSeconds)
      if (spent) {
        projectile.destroy()
      } else {
        remaining.push(projectile)
      }
    }
    this.projectiles = remaining
  }

  private drawPath(): void {
    const graphics = this.add.graphics()
    graphics.lineStyle(4, 0x3a3f4b)
    graphics.beginPath()
    graphics.moveTo(PATH_WAYPOINTS[0].x, PATH_WAYPOINTS[0].y)
    for (const point of PATH_WAYPOINTS.slice(1)) {
      graphics.lineTo(point.x, point.y)
    }
    graphics.strokePath()
  }

  private startWave(index: number): void {
    const wave = WAVES[index]
    if (!wave) {
      this.wavesCompleted = true
      return
    }

    this.time.addEvent({
      delay: wave.spawnInterval,
      repeat: wave.enemyCount - 1,
      callback: () => this.enemies.push(new Enemy(this)),
    })

    const waveDuration = wave.spawnInterval * wave.enemyCount
    this.time.delayedCall(waveDuration + 2000, () => {
      this.waveIndex += 1
      this.startWave(this.waveIndex)
    })
  }
}
