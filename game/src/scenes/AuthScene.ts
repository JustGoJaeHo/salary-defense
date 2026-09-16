import Phaser from 'phaser'
import { loginAsGuest } from '../api/auth'
import { openGoogleLoginPopup } from '../auth/googleLogin'
import { loadSession, saveSession } from '../auth/session'

export class AuthScene extends Phaser.Scene {
  private statusText?: Phaser.GameObjects.Text

  constructor() {
    super('Auth')
  }

  create(): void {
    if (loadSession()) {
      this.scene.start('Lobby')
      return
    }

    this.cameras.main.setBackgroundColor('#1d2230')

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 120, 'Salary Defense', {
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.statusText = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 130, '', {
        fontSize: '16px',
        color: '#ff6b6b',
      })
      .setOrigin(0.5)

    this.createGuestButton()
    this.createGoogleButton()
  }

  private createGuestButton(): void {
    const width = 220
    const height = 52
    const x = this.scale.width / 2
    const y = this.scale.height / 2

    const background = this.add.rectangle(x, y, width, height, 0x2ecc71, 0.9)
    background.setStrokeStyle(1, 0x4a5468)
    background.setInteractive({ useHandCursor: true })
    background.on('pointerdown', () => this.handleGuestLogin())

    this.add.text(x, y, '게스트로 시작', { fontSize: '20px', color: '#0f1115' }).setOrigin(0.5)
  }

  private createGoogleButton(): void {
    const width = 220
    const height = 52
    const x = this.scale.width / 2
    const y = this.scale.height / 2 + 72

    const background = this.add.rectangle(x, y, width, height, 0x2f3644, 0.9)
    background.setStrokeStyle(1, 0x4a5468)
    background.setInteractive({ useHandCursor: true })
    background.on('pointerdown', () => this.handleGoogleLogin())

    this.add.text(x, y, '구글로 로그인', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5)
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
