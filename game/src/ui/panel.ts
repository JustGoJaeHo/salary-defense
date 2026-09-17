import Phaser from 'phaser'
import { COLORS } from './theme'

export interface PanelOptions {
  fillColor?: number
  fillAlpha?: number
  borderColor?: number
  radius?: number
  interactive?: boolean
  hoverBorderColor?: number
  useHandCursor?: boolean
}

export interface Panel {
  graphics: Phaser.GameObjects.Graphics
  hitArea?: Phaser.GameObjects.Rectangle
}

/**
 * 둥근 모서리 패널을 그린다. interactive가 true면 같은 크기의 투명한 클릭 영역도 함께 만든다.
 * hoverBorderColor를 주면 마우스를 올렸을 때 테두리가 해당 색으로 빛난다.
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
    radius = 12,
    interactive = false,
    hoverBorderColor,
    useHandCursor = true,
  } = options

  const graphics = scene.add.graphics({ x, y })

  const draw = (strokeColor: number, lineWidth: number) => {
    graphics.clear()
    graphics.fillStyle(fillColor, fillAlpha)
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius)
    graphics.lineStyle(lineWidth, strokeColor, 1)
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, radius)
  }

  draw(borderColor, 1)

  if (!interactive) {
    return { graphics }
  }

  const hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0)
  hitArea.setInteractive({ useHandCursor })

  if (hoverBorderColor !== undefined) {
    hitArea.on('pointerover', () => draw(hoverBorderColor, 2))
    hitArea.on('pointerout', () => draw(borderColor, 1))
  }

  return { graphics, hitArea }
}

/**
 * 클릭 이벤트가 위쪽 오버레이/패널로 전파되지 않도록 막고 handler를 실행한다.
 * Modal, SidePanel 등에서 반복되는 pointerdown 보일러플레이트를 대신한다.
 */
export function onTap(target: Phaser.GameObjects.GameObject, handler: () => void): void {
  target.on(
    'pointerdown',
    (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation()
      handler()
    },
  )
}
