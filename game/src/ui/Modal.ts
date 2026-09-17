import Phaser from 'phaser'
import { createPanel, onTap } from './panel'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from './theme'

const OVERLAY_ALPHA = 0.6
const OPEN_DURATION = 200
const CLOSE_DURATION = 160

/**
 * 화면 중앙에 뜨는 재사용 가능한 모달. X 버튼 또는 바깥 영역 클릭으로 닫힌다.
 */
export class Modal {
  private scene: Phaser.Scene
  private overlay?: Phaser.GameObjects.Rectangle
  private panel?: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  get isOpen(): boolean {
    return this.panel !== undefined
  }

  open(width: number, height: number, build: (content: Phaser.GameObjects.Container) => void): void {
    this.destroyImmediate()

    const { width: screenWidth, height: screenHeight } = this.scene.scale
    const centerX = screenWidth / 2
    const centerY = screenHeight / 2

    this.overlay = this.scene.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x000000, OVERLAY_ALPHA)
    this.overlay.setDepth(2000)
    this.overlay.setAlpha(0)
    this.overlay.setInteractive()
    onTap(this.overlay, () => this.close())
    this.scene.tweens.add({ targets: this.overlay, alpha: 1, duration: OPEN_DURATION, ease: 'Quad.easeOut' })

    const { graphics: background, hitArea } = createPanel(this.scene, 0, 0, width, height, {
      fillColor: COLORS.surface,
      borderColor: COLORS.border,
      radius: 16,
      interactive: true,
      useHandCursor: false,
    })
    if (hitArea) onTap(hitArea, () => {})

    const closeButton = this.scene.add
      .text(width / 2 - 26, -height / 2 + 26, '✕', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: TEXT_COLORS.muted,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    onTap(closeButton, () => this.close())

    const content = this.scene.add.container(0, 0)

    const panelParts: Phaser.GameObjects.GameObject[] = [background, content, closeButton]
    if (hitArea) panelParts.splice(1, 0, hitArea)
    this.panel = this.scene.add.container(centerX, centerY, panelParts)
    this.panel.setDepth(2001)
    this.panel.setScale(0.92)
    this.panel.setAlpha(0)
    this.scene.tweens.add({ targets: this.panel, scale: 1, alpha: 1, duration: OPEN_DURATION, ease: 'Quad.easeOut' })

    build(content)
  }

  close(): void {
    const panel = this.panel
    const overlay = this.overlay
    if (!panel) return

    this.panel = undefined
    this.overlay = undefined

    this.scene.tweens.add({
      targets: panel,
      scale: 0.92,
      alpha: 0,
      duration: CLOSE_DURATION,
      ease: 'Quad.easeIn',
      onComplete: () => panel.destroy(),
    })
    if (overlay) {
      this.scene.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: CLOSE_DURATION,
        ease: 'Quad.easeIn',
        onComplete: () => overlay.destroy(),
      })
    }
  }

  private destroyImmediate(): void {
    this.overlay?.destroy()
    this.panel?.destroy()
    this.overlay = undefined
    this.panel = undefined
  }
}
