import Phaser from 'phaser'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from '../ui/theme'

const FADE_IN_MS = 600
const HOLD_MS = 1800
const FADE_OUT_MS = 600

export class SplashScene extends Phaser.Scene {
  constructor() {
    super('Splash')
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background)

    const logo = this.createLogo()
    logo.setAlpha(0)

    this.tweens.add({
      targets: logo,
      alpha: 1,
      duration: FADE_IN_MS,
      onComplete: () => {
        this.time.delayedCall(HOLD_MS, () => {
          this.tweens.add({
            targets: logo,
            alpha: 0,
            duration: FADE_OUT_MS,
            onComplete: () => this.scene.start('Auth'),
          })
        })
      },
    })
  }

  private createLogo(): Phaser.GameObjects.Container {
    const centerX = this.scale.width / 2
    const centerY = this.scale.height / 2

    const circle = this.add.circle(0, -20, 60, COLORS.accent)
    const mark = this.add
      .text(0, -20, 'Ho', { fontFamily: FONT_FAMILY, fontSize: '38px', fontStyle: '700', color: TEXT_COLORS.onAccent })
      .setOrigin(0.5)
    const studioName = this.add
      .text(0, 70, 'HoHo Games', { fontFamily: FONT_FAMILY, fontSize: '20px', color: TEXT_COLORS.primary })
      .setOrigin(0.5)

    return this.add.container(centerX, centerY, [circle, mark, studioName])
  }
}
