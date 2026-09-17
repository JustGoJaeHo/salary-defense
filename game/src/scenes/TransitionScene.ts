import Phaser from 'phaser'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from '../ui/theme'

export const TRANSITION_SCENE_KEY = 'Transition'

const WIPE_DURATION_MS = 380
const SPIN_DURATION_MS = 900
const MIN_EXTRA_LOADING_MS = 1000

/** forward: 앞으로 나아가는 이동(로비->스테이지->레벨), back: 뒤로 돌아가는 이동. */
export type TransitionDirection = 'forward' | 'back'

/**
 * 화면 전환 연출만 전담하는 상시 대기 오버레이 씬. 게임이 켜져 있는 동안 멈추지 않고
 * 항상 최상위에 떠 있다가, cover()가 호출되면 방향에 따라 우->좌(forward) 또는 좌->우(back)로 화면을 덮는다.
 * 도착한 씬은 콘텐츠를 다 그린 뒤 반드시 reveal()을 호출해야 덮개가 반대쪽 끝으로 걷힌다.
 */
export class TransitionScene extends Phaser.Scene {
  private coverRect?: Phaser.GameObjects.Rectangle
  private spinner?: Phaser.GameObjects.Text
  private label?: Phaser.GameObjects.Text
  private spinTween?: Phaser.Tweens.Tween
  private direction: TransitionDirection = 'forward'

  constructor() {
    super(TRANSITION_SCENE_KEY)
  }

  cover(onCovered: () => void, direction: TransitionDirection = 'forward'): void {
    if (this.coverRect) return

    this.direction = direction
    this.scene.bringToTop()

    const { width, height } = this.scale
    const fromRight = direction === 'forward'
    const rect = this.add
      .rectangle(fromRight ? width : 0, height / 2, width, height, COLORS.background, 1)
      .setOrigin(fromRight ? 1 : 0, 0.5)
    rect.scaleX = 0
    this.coverRect = rect

    this.tweens.add({
      targets: rect,
      scaleX: 1,
      duration: WIPE_DURATION_MS,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.showLoading()
        onCovered()
      },
    })
  }

  reveal(): void {
    const rect = this.coverRect
    if (!rect) return
    this.coverRect = undefined

    // 실제 작업이 아무리 빨리 끝나도 로딩 스피너가 최소한 이 시간만큼은 보이도록 지연 후 닫는다.
    this.time.delayedCall(MIN_EXTRA_LOADING_MS, () => this.closeCover(rect))
  }

  private closeCover(rect: Phaser.GameObjects.Rectangle): void {
    this.spinTween?.stop()
    this.spinner?.destroy()
    this.label?.destroy()
    this.spinner = undefined
    this.label = undefined

    const { width } = this.scale
    const fromRight = this.direction === 'forward'

    // cover 단계에서 고정했던 반대쪽 끝으로 고정 축을 옮겨도 같은 자리를 그대로 덮고 있으므로 시각적 끊김이 없고,
    // 이제 scaleX를 줄이면 그 반대쪽 끝부터 걷히는 것처럼 보인다.
    rect.setOrigin(fromRight ? 0 : 1, 0.5)
    rect.x = fromRight ? 0 : width

    this.tweens.add({
      targets: rect,
      scaleX: 0,
      duration: WIPE_DURATION_MS,
      ease: 'Quad.easeInOut',
      onComplete: () => rect.destroy(),
    })
  }

  private showLoading(): void {
    const { width, height } = this.scale

    this.spinner = this.add
      .text(width / 2, height / 2 - 16, '⟳', { fontFamily: FONT_FAMILY, fontSize: '48px', color: TEXT_COLORS.link })
      .setOrigin(0.5)
    this.label = this.add
      .text(width / 2, height / 2 + 42, '불러오는 중', { fontFamily: FONT_FAMILY, fontSize: '14px', color: TEXT_COLORS.muted })
      .setOrigin(0.5)

    this.spinTween = this.tweens.add({ targets: this.spinner, angle: 360, duration: SPIN_DURATION_MS, repeat: -1 })
  }
}
