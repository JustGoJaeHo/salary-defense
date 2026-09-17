import Phaser from 'phaser'
import { createPanel } from './panel'
import { COLORS, TEXT_COLORS } from './theme'

const OVERLAY_ALPHA = 0.6

/**
 * 화면 중앙에 뜨는 재사용 가능한 모달. 오른쪽 위 X 버튼으로만 닫힌다.
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
    this.close()

    const { width: screenWidth, height: screenHeight } = this.scene.scale
    const centerX = screenWidth / 2
    const centerY = screenHeight / 2

    this.overlay = this.scene.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x000000, OVERLAY_ALPHA)
    this.overlay.setDepth(2000)
    this.overlay.setInteractive()
    this.overlay.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation()
      },
    )

    const { graphics: background } = createPanel(this.scene, 0, 0, width, height, {
      fillColor: COLORS.surface,
      borderColor: COLORS.border,
      radius: 20,
    })

    const closeButton = this.scene.add
      .text(width / 2 - 26, -height / 2 + 26, '✕', { fontSize: '20px', color: TEXT_COLORS.muted })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    closeButton.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation()
        this.close()
      },
    )

    const content = this.scene.add.container(0, 0)

    this.panel = this.scene.add.container(centerX, centerY, [background, content, closeButton])
    this.panel.setDepth(2001)

    build(content)
  }

  close(): void {
    this.overlay?.destroy()
    this.panel?.destroy()
    this.overlay = undefined
    this.panel = undefined
  }
}
