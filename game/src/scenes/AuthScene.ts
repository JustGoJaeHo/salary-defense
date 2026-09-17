import Phaser from 'phaser'
import { loginAsGuest } from '../api/auth'
import { openGoogleLoginPopup } from '../auth/googleLogin'
import { loadSession, saveSession, type AuthSession } from '../auth/session'
import { createPanel } from '../ui/panel'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from '../ui/theme'

export class AuthScene extends Phaser.Scene {
  private statusText?: Phaser.GameObjects.Text

  constructor() {
    super('Auth')
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background)

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 130, '월급 디펜스', {
        fontFamily: FONT_FAMILY,
        fontSize: '34px',
        fontStyle: '700',
        color: TEXT_COLORS.primary,
      })
      .setOrigin(0.5)

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 90, 'SALARY DEFENSE', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: TEXT_COLORS.muted,
        letterSpacing: 4,
      })
      .setOrigin(0.5)

    this.statusText = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 130, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: TEXT_COLORS.danger,
      })
      .setOrigin(0.5)

    const session = loadSession()
    if (session) {
      this.createWelcomeText(session)
      this.createEnterButton()
    } else {
      this.createGuestButton()
      this.createGoogleButton()
    }
  }

  private createWelcomeText(session: AuthSession): void {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 40, `${session.user.name}님, 환영합니다`, {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        color: TEXT_COLORS.muted,
      })
      .setOrigin(0.5)
  }

  private createEnterButton(): void {
    const x = this.scale.width / 2
    const y = this.scale.height / 2
    this.createButton(x, y, '입장하기', 'primary', () => this.scene.start('Lobby'))
  }

  private createGuestButton(): void {
    const x = this.scale.width / 2
    const y = this.scale.height / 2
    this.createButton(x, y, '게스트로 시작', 'primary', () => this.handleGuestLogin())
  }

  private createGoogleButton(): void {
    const x = this.scale.width / 2
    const y = this.scale.height / 2 + 72
    this.createButton(x, y, 'Google로 로그인', 'secondary', () => this.handleGoogleLogin())
  }

  private createButton(x: number, y: number, label: string, variant: 'primary' | 'secondary', onClick: () => void): void {
    const width = 220
    const height = 52

    const { hitArea } = createPanel(this, x, y, width, height, {
      fillColor: variant === 'primary' ? COLORS.accent : COLORS.surfaceAlt,
      borderColor: variant === 'primary' ? COLORS.accent : COLORS.border,
      radius: 10,
      interactive: true,
    })
    hitArea?.on('pointerdown', () => onClick())

    this.add
      .text(x, y, label, {
        fontFamily: FONT_FAMILY,
        fontSize: '17px',
        fontStyle: '600',
        color: variant === 'primary' ? TEXT_COLORS.onAccent : TEXT_COLORS.primary,
      })
      .setOrigin(0.5)
  }

  private async handleGuestLogin(): Promise<void> {
    try {
      const session = await loginAsGuest()
      saveSession(session)
      this.scene.start('Lobby')
    } catch (error) {
      this.showError(error)
    }
  }

  private async handleGoogleLogin(): Promise<void> {
    try {
      const session = await openGoogleLoginPopup()
      saveSession(session)
      this.scene.start('Lobby')
    } catch (error) {
      this.showError(error)
    }
  }

  private showError(error: unknown): void {
    const message = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
    this.statusText?.setText(message)
  }
}
