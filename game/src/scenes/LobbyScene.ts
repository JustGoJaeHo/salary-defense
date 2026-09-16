import Phaser from 'phaser'
import { fetchGoogleLinkTicket, UnauthorizedError } from '../api/auth'
import { openGoogleLoginPopup } from '../auth/googleLogin'
import { clearSession, loadSession, saveSession, type AuthSession } from '../auth/session'

export class LobbyScene extends Phaser.Scene {
  private session!: AuthSession
  private statusText?: Phaser.GameObjects.Text

  constructor() {
    super('Lobby')
  }

  create(): void {
    const session = loadSession()
    if (!session) {
      this.scene.start('Auth')
      return
    }
    this.session = session

    this.cameras.main.setBackgroundColor('#1d2230')

    this.add
      .text(this.scale.width / 2, 100, 'Salary Defense', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.createUserInfo()

    this.createMenuButton(this.scale.height / 2 - 80, '게임시작', () => this.scene.start('Main'))
    this.createMenuButton(this.scale.height / 2, '랭킹', () => console.log('랭킹 미구현'))
    this.createMenuButton(this.scale.height / 2 + 80, '인벤토리', () => console.log('인벤토리 미구현'))
    this.createMenuButton(this.scale.height / 2 + 160, '이벤트', () => console.log('이벤트 미구현'))

    this.statusText = this.add
      .text(this.scale.width / 2, this.scale.height - 40, '', {
        fontSize: '14px',
        color: '#ff6b6b',
      })
      .setOrigin(0.5)
  }

  private createUserInfo(): void {
    const status = this.session.user.is_guest ? '게스트로 플레이 중' : '구글 계정으로 로그인됨'

    this.add
      .text(this.scale.width / 2, 150, `${this.session.user.name} (${status})`, {
        fontSize: '16px',
        color: '#c7ccd6',
      })
      .setOrigin(0.5)

    if (this.session.user.is_guest) {
      this.add
        .text(this.scale.width / 2, 180, '구글 계정 연동', {
          fontSize: '14px',
          color: '#4dabf7',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.handleGoogleLink())
    }
  }

  private createMenuButton(y: number, label: string, onClick: () => void): void {
    const width = 200
    const height = 56
    const x = this.scale.width / 2

    const background = this.add.rectangle(x, y, width, height, 0x2f3644, 0.9)
    background.setStrokeStyle(1, 0x4a5468)
    background.setInteractive({ useHandCursor: true })
    background.on('pointerdown', onClick)

    this.add.text(x, y, label, { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5)
  }

  private async handleGoogleLink(): Promise<void> {
    try {
      const ticket = await fetchGoogleLinkTicket(this.session.token)
      const session = await openGoogleLoginPopup(ticket)
      saveSession(session)
      this.scene.restart()
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        clearSession()
        this.scene.start('Auth')
        return
      }

      this.showError(error)
    }
  }

  private showError(error: unknown): void {
    const message = error instanceof Error ? error.message : '구글 계정 연동 중 오류가 발생했습니다.'
    this.statusText?.setText(message)
  }
}
