import Phaser from 'phaser'
import { createPanel } from './panel'
import { COLORS, TEXT_COLORS } from './theme'

export interface SidePanelItem {
  label: string
  onClick: () => void
}

type Side = 'left' | 'right'

/**
 * 화면 옆에서 슬라이드로 나타나는 메뉴 패널. 바깥 영역을 누르면 닫힌다.
 */
export class SidePanel {
  private scene: Phaser.Scene
  private side: Side
  private width: number
  private overlay?: Phaser.GameObjects.Rectangle
  private panel?: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene, side: Side, width = 240) {
    this.scene = scene
    this.side = side
    this.width = width
  }

  get isOpen(): boolean {
    return this.panel !== undefined
  }

  open(items: SidePanelItem[]): void {
    this.close()

    const { width: screenWidth, height: screenHeight } = this.scene.scale
    const centerY = screenHeight / 2
    const panelHeight = screenHeight - 40
    const restX = this.side === 'right' ? screenWidth - this.width / 2 - 12 : this.width / 2 + 12
    const startX = this.side === 'right' ? screenWidth + this.width / 2 : -this.width / 2

    this.overlay = this.scene.add.rectangle(screenWidth / 2, centerY, screenWidth, screenHeight, 0x000000, 0.45)
    this.overlay.setDepth(1500)
    this.overlay.setInteractive()
    this.overlay.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation()
        this.close()
      },
    )

    const { graphics: background } = createPanel(this.scene, 0, 0, this.width, panelHeight, {
      fillColor: COLORS.surface,
      borderColor: COLORS.border,
      radius: 20,
    })

    const rows: Phaser.GameObjects.GameObject[] = [background]
    const startY = -panelHeight / 2 + 60

    items.forEach((item, index) => {
      const y = startY + index * 64
      const label = this.scene.add
        .text(0, y, item.label, { fontSize: '18px', color: TEXT_COLORS.primary })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
      label.on(
        'pointerdown',
        (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
          event.stopPropagation()
          item.onClick()
        },
      )
      rows.push(label)
    })

    const closeLabel = this.scene.add
      .text(0, panelHeight / 2 - 40, '닫기', { fontSize: '15px', color: TEXT_COLORS.muted })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    closeLabel.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation()
        this.close()
      },
    )
    rows.push(closeLabel)

    this.panel = this.scene.add.container(startX, centerY, rows)
    this.panel.setDepth(1501)

    this.scene.tweens.add({ targets: this.panel, x: restX, duration: 260, ease: 'Quad.easeOut' })
  }

  close(): void {
    this.overlay?.destroy()
    this.panel?.destroy()
    this.overlay = undefined
    this.panel = undefined
  }
}
