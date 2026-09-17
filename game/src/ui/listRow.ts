import Phaser from 'phaser'
import { createPanel, onTap } from './panel'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from './theme'

const ROW_WIDTH = 420
const ROW_HEIGHT = 56

export type ListRowStatus = { label: string; tone: 'muted' | 'success' } | null

/**
 * 스테이지/레벨 목록에서 공용으로 쓰는 한 줄짜리 선택 행.
 */
export function renderListRow(
  scene: Phaser.Scene,
  content: Phaser.GameObjects.Container,
  y: number,
  label: string,
  status: ListRowStatus,
  unlocked: boolean,
  onClick: () => void,
): void {
  const { graphics, hitArea } = createPanel(scene, 0, y, ROW_WIDTH, ROW_HEIGHT, {
    fillColor: unlocked ? COLORS.surfaceAlt : COLORS.surface,
    fillAlpha: unlocked ? 1 : 0.5,
    radius: 10,
    interactive: unlocked,
    hoverBorderColor: unlocked ? COLORS.accent : undefined,
  })
  content.add(graphics)

  const labelText = scene.add
    .text(-180, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: unlocked ? TEXT_COLORS.primary : TEXT_COLORS.muted,
    })
    .setOrigin(0, 0.5)
  content.add(labelText)

  if (status) {
    const statusColor = status.tone === 'success' ? TEXT_COLORS.success : TEXT_COLORS.muted
    const statusText = scene.add
      .text(180, y, status.label, { fontFamily: FONT_FAMILY, fontSize: '13px', color: statusColor })
      .setOrigin(1, 0.5)
    content.add(statusText)
  }

  if (!hitArea) return

  content.add(hitArea)
  onTap(hitArea, onClick)
}
