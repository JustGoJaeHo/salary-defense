import Phaser from 'phaser'
import { COLORS } from './theme'

export interface PanelOptions {
  fillColor?: number
  fillAlpha?: number
  borderColor?: number
  radius?: number
  interactive?: boolean
}

export interface Panel {
  graphics: Phaser.GameObjects.Graphics
  hitArea?: Phaser.GameObjects.Rectangle
}

/**
 * 둥근 모서리 패널을 그린다. interactive가 true면 같은 크기의 투명한 클릭 영역도 함께 만든다.
 */
export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: PanelOptions = {},
): Panel {
  const {
    fillColor = COLORS.surface,
    fillAlpha = 1,
    borderColor = COLORS.border,
    radius = 16,
    interactive = false,
  } = options

  const graphics = scene.add.graphics({ x, y })
  graphics.fillStyle(fillColor, fillAlpha)
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius)
  graphics.lineStyle(1, borderColor, 1)
  graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, radius)

  if (!interactive) {
    return { graphics }
  }

  const hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0)
  hitArea.setInteractive({ useHandCursor: true })

  return { graphics, hitArea }
}
