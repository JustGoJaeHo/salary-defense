import Phaser from 'phaser'
import { PATH_WAYPOINTS, type Point } from '../game/path'
import type { WaveConfig } from '../game/waves'
import { Enemy } from '../game/Enemy'
import { Tower, TOWER_COST } from '../game/Tower'
import { Projectile } from '../game/Projectile'
import { GRID_SIZE, snapToGrid, distanceToPath } from '../game/grid'
import { submitGameResult } from '../api/gameResults'
import { fetchLevel } from '../api/levels'
import { fetchStages } from '../api/stages'
import { loadSession, type AuthSession } from '../auth/session'
import { stageSceneKey } from './StageScene'
import { TransitionScene, TRANSITION_SCENE_KEY } from './TransitionScene'
import { createPanel, onTap } from '../ui/panel'
import { COLORS, FONT_FAMILY, GAME_COLORS, TEXT_COLORS } from '../ui/theme'

const PLAYER_LIVES = 10
const STARTING_GOLD = 100
const PATH_CLEARANCE = 44
const PREP_DELAY_MS = 3000

// 상단 상태바와 하단 버튼이 차지하는 만큼 타워 배치 필드를 좁혀서 화면을 낭비하지 않는다.
const HUD_HEIGHT = 52
const BUTTON_HEIGHT = 42
const BUTTON_WIDTH = 96
const BUTTON_GAP = 8
const BUTTON_MARGIN = 16
const BOTTOM_BAR_HEIGHT = BUTTON_HEIGHT + BUTTON_MARGIN
const BOTTOM_BUTTON_COUNT = 3

interface MainSceneData {
  levelId: number
  stageKey: string
}

export class MainScene extends Phaser.Scene {
  private session!: AuthSession
  private transition!: TransitionScene
  private levelId!: number
  private stageKey!: string
  private waves: WaveConfig[] = []
  private enemies: Enemy[] = []
  private towers: Tower[] = []
  private projectiles: Projectile[] = []
  private waveIndex = 0
  private lives = PLAYER_LIVES
  private gold = STARTING_GOLD
  private wavesCompleted = false
  private gameOver = false
  private paused = false
  private ready = false

  private livesText!: Phaser.GameObjects.Text
  private goldText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private pauseButtonText!: Phaser.GameObjects.Text

  constructor() {
    super('Main')
  }

  init(data: MainSceneData): void {
    this.levelId = data.levelId
    this.stageKey = data.stageKey
  }

  create(): void {
    const session = loadSession()
    if (!session) {
      this.scene.start('Auth')
      return
    }
    this.session = session
    this.transition = this.scene.get<TransitionScene>(TRANSITION_SCENE_KEY)

    this.cameras.main.setBackgroundColor(COLORS.background)

    this.loadLevel()
  }

  private async loadLevel(): Promise<void> {
    try {
      const level = await fetchLevel(this.levelId, this.session.token)
      this.waves = level.waves
      this.startGame()
    } catch (error) {
      const message = error instanceof Error ? error.message : '게임 정보를 불러오지 못했습니다.'
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, message, {
          fontFamily: FONT_FAMILY,
          fontSize: '15px',
          color: TEXT_COLORS.muted,
        })
        .setOrigin(0.5)
    }
    this.transition.reveal()
  }

  private startGame(): void {
    this.resetState()
    this.drawPlacementGrid()
    this.drawPath()
    this.createHud()
    this.createPauseButton()
    this.createQuitButton()
    this.createSpawnButton()
    // 입장 직후 바로 몬스터가 나오지 않도록 타워를 배치할 준비 시간을 준다.
    this.time.delayedCall(PREP_DELAY_MS, () => this.startWave(this.waveIndex))
    this.ready = true
  }

  update(_time: number, deltaMs: number): void {
    if (!this.ready) return
    if (this.gameOver) return
    if (this.paused) return

    const deltaSeconds = deltaMs / 1000

    this.updateEnemies(deltaSeconds)
    if (this.gameOver) return

    this.updateTowers(deltaMs)
    this.updateProjectiles(deltaSeconds)
  }

  private get fieldTop(): number {
    return HUD_HEIGHT
  }

  /** 남는 세로 공간이 GRID_SIZE의 배수가 되도록 아래쪽 경계를 반올림해 그리드가 딱 맞게 채워지도록 한다. */
  private get fieldBottom(): number {
    const rows = Math.floor((this.scale.height - HUD_HEIGHT - BOTTOM_BAR_HEIGHT) / GRID_SIZE)
    return HUD_HEIGHT + rows * GRID_SIZE
  }

  /** 화면 폭이 GRID_SIZE로 나머지 없이 나눠지지 않을 때 남는 여백을 좌우로 균등하게 배분한다. */
  private get fieldLeft(): number {
    const cols = Math.floor(this.scale.width / GRID_SIZE)
    return (this.scale.width - cols * GRID_SIZE) / 2
  }

  private get fieldRight(): number {
    const cols = Math.floor(this.scale.width / GRID_SIZE)
    return this.fieldLeft + cols * GRID_SIZE
  }

  private isWithinField(cell: Point): boolean {
    return cell.x >= this.fieldLeft && cell.x < this.fieldRight && cell.y >= this.fieldTop && cell.y < this.fieldBottom
  }

  private resetState(): void {
    this.enemies = []
    this.towers = []
    this.projectiles = []
    this.waveIndex = 0
    this.lives = PLAYER_LIVES
    this.gold = STARTING_GOLD
    this.wavesCompleted = false
    this.gameOver = false
    this.paused = false
    this.ready = false
    this.time.paused = false
  }

  private createHud(): void {
    const width = this.scale.width

    this.add.rectangle(width / 2, HUD_HEIGHT / 2, width, HUD_HEIGHT, COLORS.surface, 0.96).setDepth(900)
    this.add.rectangle(width / 2, HUD_HEIGHT, width, 1, COLORS.border).setOrigin(0.5, 0).setDepth(900)

    const hudStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      fontStyle: '600',
      color: TEXT_COLORS.primary,
    }

    this.livesText = this.add.text(16, HUD_HEIGHT / 2, '', hudStyle).setOrigin(0, 0.5).setDepth(901)
    this.goldText = this.add.text(width / 2, HUD_HEIGHT / 2, '', hudStyle).setOrigin(0.5).setDepth(901)
    this.waveText = this.add.text(width - 16, HUD_HEIGHT / 2, '', hudStyle).setOrigin(1, 0.5).setDepth(901)
    this.refreshHud()
  }

  private refreshHud(): void {
    this.livesText.setText(`체력 ${this.lives}`)
    this.goldText.setText(`자금 ${this.gold}`)
    const currentWave = Math.min(this.waveIndex + 1, this.waves.length)
    this.waveText.setText(`라운드 ${currentWave}/${this.waves.length}`)
  }

  /** 하단 버튼 3개를 화면 가로 중앙을 기준으로 나란히 배치하기 위한 index번째 버튼의 중심 x좌표. */
  private bottomButtonCenterX(index: number): number {
    const totalWidth = BOTTOM_BUTTON_COUNT * BUTTON_WIDTH + (BOTTOM_BUTTON_COUNT - 1) * BUTTON_GAP
    const startX = (this.scale.width - totalWidth) / 2
    return startX + index * (BUTTON_WIDTH + BUTTON_GAP) + BUTTON_WIDTH / 2
  }

  private createPauseButton(): void {
    const width = BUTTON_WIDTH
    const height = BUTTON_HEIGHT
    const x = this.bottomButtonCenterX(1)
    const y = this.scale.height - height / 2 - BUTTON_MARGIN

    const { graphics, hitArea } = createPanel(this, x, y, width, height, {
      fillColor: COLORS.surfaceAlt,
      fillAlpha: 0.95,
      borderColor: COLORS.border,
      radius: 10,
      interactive: true,
      hoverBorderColor: COLORS.accent,
    })
    graphics.setDepth(1000)
    hitArea?.setDepth(1000)
    if (hitArea) onTap(hitArea, () => this.togglePause())

    this.pauseButtonText = this.add.text(x, y, '일시정지', {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      color: TEXT_COLORS.primary,
    })
    this.pauseButtonText.setOrigin(0.5)
    this.pauseButtonText.setDepth(1001)
  }

  private togglePause(): void {
    if (this.gameOver) return

    this.paused = !this.paused
    this.time.paused = this.paused
    this.pauseButtonText.setText(this.paused ? '재시작' : '일시정지')
  }

  private createQuitButton(): void {
    const width = BUTTON_WIDTH
    const height = BUTTON_HEIGHT
    const x = this.bottomButtonCenterX(0)
    const y = this.scale.height - height / 2 - BUTTON_MARGIN

    const { graphics, hitArea } = createPanel(this, x, y, width, height, {
      fillColor: COLORS.surfaceAlt,
      fillAlpha: 0.95,
      borderColor: COLORS.border,
      radius: 10,
      interactive: true,
      hoverBorderColor: COLORS.accent,
    })
    graphics.setDepth(1000)
    hitArea?.setDepth(1000)
    if (hitArea) onTap(hitArea, () => this.transition.cover(() => this.returnToStage(), 'back'))

    const text = this.add.text(x, y, '나가기', { fontFamily: FONT_FAMILY, fontSize: '15px', color: TEXT_COLORS.primary })
    text.setOrigin(0.5)
    text.setDepth(1001)
  }

  private async returnToStage(): Promise<void> {
    try {
      const stages = await fetchStages(this.session.token)
      const stage = stages.find((candidate) => candidate.key === this.stageKey)
      if (stage) {
        this.scene.start(stageSceneKey(stage.key), { stage })
        return
      }
    } catch (error) {
      console.error('Failed to reload stage', error)
    }
    this.scene.start('Lobby')
  }

  private createSpawnButton(): void {
    const width = BUTTON_WIDTH
    const height = BUTTON_HEIGHT
    const x = this.bottomButtonCenterX(2)
    const y = this.scale.height - height / 2 - BUTTON_MARGIN

    const { graphics, hitArea } = createPanel(this, x, y, width, height, {
      fillColor: COLORS.accent,
      borderColor: COLORS.accent,
      radius: 10,
      interactive: true,
    })
    graphics.setDepth(1000)
    hitArea?.setDepth(1000)
    if (hitArea) onTap(hitArea, () => this.spawnTower())

    const text = this.add.text(x, y, '배치', { fontFamily: FONT_FAMILY, fontSize: '15px', fontStyle: '600', color: TEXT_COLORS.onAccent })
    text.setOrigin(0.5)
    text.setDepth(1001)
  }

  private spawnTower(): void {
    if (this.gameOver) return
    if (this.paused) return
    if (this.gold < TOWER_COST) return

    const nearestEnemy = this.findSoonestArrivingEnemy()
    const target = nearestEnemy ? { x: nearestEnemy.graphic.x, y: nearestEnemy.graphic.y } : undefined
    const cell = this.findSpawnCell(target)
    if (!cell) return

    this.gold -= TOWER_COST
    const tower = new Tower(this, cell.x, cell.y)
    this.towers.push(tower)
    this.makeDraggable(tower)
    this.refreshHud()
  }

  /** 현재 남아있는 적 중 경로 끝까지 가장 적게 남은, 즉 가장 먼저 도착할 적을 찾는다. */
  private findSoonestArrivingEnemy(): Enemy | null {
    let soonest: Enemy | null = null
    let shortestRemaining = Infinity

    for (const enemy of this.enemies) {
      const remaining = enemy.remainingDistanceToEnd()
      if (remaining < shortestRemaining) {
        shortestRemaining = remaining
        soonest = enemy
      }
    }

    return soonest
  }

  /** target이 있으면 그 위치에서 가장 가까운 빈 칸을, 없으면 경로에서 가장 가까운 빈 칸을 고른다. */
  private findSpawnCell(target?: Point): Point | null {
    const cols = Math.floor(this.scale.width / GRID_SIZE)
    const rows = Math.floor((this.fieldBottom - this.fieldTop) / GRID_SIZE)

    let closest: Point | null = null
    let closestDistance = Infinity

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const centerX = this.fieldLeft + col * GRID_SIZE + GRID_SIZE / 2
        const centerY = this.fieldTop + row * GRID_SIZE + GRID_SIZE / 2
        const pathClearance = distanceToPath(centerX, centerY, PATH_WAYPOINTS)

        if (pathClearance < PATH_CLEARANCE) continue
        if (this.isCellOccupied({ x: centerX, y: centerY })) continue

        const rankDistance = target ? Math.hypot(centerX - target.x, centerY - target.y) : pathClearance
        if (rankDistance < closestDistance) {
          closestDistance = rankDistance
          closest = { x: centerX, y: centerY }
        }
      }
    }

    return closest
  }

  private makeDraggable(tower: Tower): void {
    const graphic = tower.graphic
    graphic.setInteractive({ useHandCursor: true })
    this.input.setDraggable(graphic)

    let originX = graphic.x
    let originY = graphic.y

    graphic.on('dragstart', () => {
      originX = graphic.x
      originY = graphic.y
    })

    graphic.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      graphic.x = dragX
      graphic.y = dragY
    })

    graphic.on('dragend', () => {
      const cell = snapToGrid(graphic.x, graphic.y, this.fieldLeft, this.fieldTop)
      const blocked = distanceToPath(cell.x, cell.y, PATH_WAYPOINTS) < PATH_CLEARANCE
      const outOfField = !this.isWithinField(cell)
      const occupied = this.isCellOccupied(cell, tower)

      if (blocked || outOfField || occupied) {
        graphic.setPosition(originX, originY)
        return
      }

      graphic.setPosition(cell.x, cell.y)
    })
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
      this.endGame(false)
      return
    }

    if (this.wavesCompleted && this.enemies.length === 0) {
      this.endGame(true)
    }
  }

  private endGame(cleared: boolean): void {
    this.gameOver = true
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, cleared ? '스테이지 클리어' : '게임 오버', {
        fontFamily: FONT_FAMILY,
        fontSize: '34px',
        fontStyle: '700',
        color: cleared ? TEXT_COLORS.success : TEXT_COLORS.danger,
      })
      .setOrigin(0.5)

    const waveReached = Math.min(this.waveIndex + 1, this.waves.length)

    submitGameResult({ levelId: this.levelId, cleared, waveReached }, this.session.token).catch((error) => {
      console.error('Failed to submit game result', error)
    })
  }

  private isCellOccupied(cell: Point, exclude?: Tower): boolean {
    return this.towers.some(
      (tower) => tower !== exclude && tower.graphic.x === cell.x && tower.graphic.y === cell.y,
    )
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

  private drawPlacementGrid(): void {
    const graphics = this.add.graphics()

    const cols = Math.floor(this.scale.width / GRID_SIZE)
    const rows = Math.floor((this.fieldBottom - this.fieldTop) / GRID_SIZE)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = this.fieldLeft + col * GRID_SIZE
        const cellY = this.fieldTop + row * GRID_SIZE
        const centerX = cellX + GRID_SIZE / 2
        const centerY = cellY + GRID_SIZE / 2

        if (distanceToPath(centerX, centerY, PATH_WAYPOINTS) < PATH_CLEARANCE) {
          graphics.fillStyle(0xffffff, 1)
          graphics.fillRect(cellX, cellY, GRID_SIZE, GRID_SIZE)
          continue
        }

        graphics.fillStyle(GAME_COLORS.placement, 0.1)
        graphics.lineStyle(1, GAME_COLORS.placement, 0.3)
        graphics.fillRect(cellX, cellY, GRID_SIZE, GRID_SIZE)
        graphics.strokeRect(cellX, cellY, GRID_SIZE, GRID_SIZE)
      }
    }
  }

  private drawPath(): void {
    const graphics = this.add.graphics()
    graphics.lineStyle(4, GAME_COLORS.path)
    graphics.beginPath()
    graphics.moveTo(PATH_WAYPOINTS[0].x, PATH_WAYPOINTS[0].y)
    for (const point of PATH_WAYPOINTS.slice(1)) {
      graphics.lineTo(point.x, point.y)
    }
    graphics.strokePath()
  }

  private startWave(index: number): void {
    const wave = this.waves[index]
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
