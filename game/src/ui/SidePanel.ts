import Phaser from 'phaser'
import { createPanel, onTap } from './panel'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from './theme'

export interface SidePanelItem {
  label: string
  onClick: () => void
}

type Side = 'left' | 'right'

const SLIDE_DURATION = 260
const ITEM_ROW_HEIGHT = 64
const ITEM_HIT_HEIGHT = 48

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
    this.destroyImmediate()

    const { width: screenWidth, height: screenHeight } = this.scene.scale
    const centerY = screenHeight / 2
    const panelHeight = screenHeight - 40
    const restX = this.side === 'right' ? screenWidth - this.width / 2 - 12 : this.width / 2 + 12
    const startX = this.side === 'right' ? screenWidth + this.width / 2 : -this.width / 2

    this.overlay = this.scene.add.rectangle(screenWidth / 2, centerY, screenWidth, screenHeight, 0x000000, 0.45)
    this.overlay.setDepth(1500)
    this.overlay.setAlpha(0)
    this.overlay.setInteractive()
    onTap(this.overlay, () => this.close())
    this.scene.tweens.add({ targets: this.overlay, alpha: 1, duration: SLIDE_DURATION, ease: 'Quad.easeOut' })

    const { graphics: background } = createPanel(this.scene, 0, 0, this.width, panelHeight, {
      fillColor: COLORS.surface,
      borderColor: COLORS.border,
      radius: 16,
    })

    const rows: Phaser.GameObjects.GameObject[] = [background]
    const startY = -panelHeight / 2 + 60

    items.forEach((item, index) => {
      const y = startY + index * ITEM_ROW_HEIGHT
      const { hitArea } = createPanel(this.scene, 0, y, this.width - 32, ITEM_HIT_HEIGHT, {
        fillAlpha: 0,
        radius: 10,
        interactive: true,
        hoverBorderColor: COLORS.accent,
      })
      const label = this.scene.add
        .text(0, y, item.label, { fontFamily: FONT_FAMILY, fontSize: '17px', color: TEXT_COLORS.primary })
        .setOrigin(0.5)
      if (hitArea) onTap(hitArea, () => item.onClick())
      rows.push(label)
      if (hitArea) rows.push(hitArea)
    })

    const closeLabel = this.scene.add
      .text(0, panelHeight / 2 - 40, '닫기', { fontFamily: FONT_FAMILY, fontSize: '14px', color: TEXT_COLORS.muted })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    onTap(closeLabel, () => this.close())
    rows.push(closeLabel)

    this.panel = this.scene.add.container(startX, centerY, rows)
    this.panel.setDepth(1501)

    this.scene.tweens.add({ targets: this.panel, x: restX, duration: SLIDE_DURATION, ease: 'Quad.easeOut' })
  }

  close(): void {
    const panel = this.panel
    const overlay = this.overlay
    if (!panel) return

    this.panel = undefined
    this.overlay = undefined

    const { width: screenWidth } = this.scene.scale
    const exitX = this.side === 'right' ? screenWidth + this.width / 2 : -this.width / 2

    this.scene.tweens.add({
      targets: panel,
      x: exitX,
      duration: SLIDE_DURATION,
      ease: 'Quad.easeIn',
      onComplete: () => panel.destroy(),
    })
    if (overlay) {
      this.scene.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: SLIDE_DURATION,
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
