import Phaser from 'phaser'
import type { Stage } from '../api/stages'
import { loadSession } from '../auth/session'
import { renderListRow, type ListRowStatus } from '../ui/listRow'
import { onTap } from '../ui/panel'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from '../ui/theme'
import { TransitionScene, TRANSITION_SCENE_KEY } from './TransitionScene'

export const STAGE_KEYS = ['part_time', 'sme', 'mid_size', 'large_corp', 'business', 'global'] as const

export function stageSceneKey(stageKey: string): string {
  return `Stage:${stageKey}`
}

interface StageSceneData {
  stage: Stage
}

/**
 * 스테이지 하나의 레벨 목록을 보여주는 씬. 스테이지마다 같은 클래스를 다른 key로 등록해서 사용한다.
 * 로비에서 이미 불러온 스테이지 데이터를 그대로 넘겨받으므로 별도 로딩 상태 없이 바로 그린다.
 */
export class StageScene extends Phaser.Scene {
  private stage!: Stage
  private content!: Phaser.GameObjects.Container
  private transition!: TransitionScene

  constructor(stageKey: string) {
    super(stageSceneKey(stageKey))
  }

  init(data: StageSceneData): void {
    this.stage = data.stage
  }

  create(): void {
    if (!loadSession()) {
      this.scene.start('Auth')
      return
    }
    this.transition = this.scene.get<TransitionScene>(TRANSITION_SCENE_KEY)

    this.cameras.main.setBackgroundColor(COLORS.background)
    this.content = this.add.container(this.scale.width / 2, 0)

    this.createBackButton()
    this.renderStage(this.stage)
    this.transition.reveal()
  }

  private createBackButton(): void {
    const backButton = this.add
      .text(24, 32, '← 집으로', { fontFamily: FONT_FAMILY, fontSize: '13px', color: TEXT_COLORS.link })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
    onTap(backButton, () => this.transition.cover(() => this.scene.start('Lobby'), 'back'))
  }

  private renderStage(stage: Stage): void {
    this.add
      .text(this.scale.width / 2, 36, stage.name, {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        fontStyle: '700',
        color: TEXT_COLORS.primary,
      })
      .setOrigin(0.5)

    const startY = 120
    const rowHeight = 68

    stage.levels.forEach((level, index) => {
      const y = startY + index * rowHeight
      const status: ListRowStatus = !level.unlocked
        ? { label: '잠김', tone: 'muted' }
        : level.cleared
          ? { label: '완료', tone: 'success' }
          : null

      renderListRow(this, this.content, y, level.name, status, level.unlocked, () => this.startLevel(level.id))
    })
  }

  private startLevel(levelId: number): void {
    this.transition.cover(() => this.scene.start('Main', { levelId, stageKey: this.stage.key }))
  }
}
