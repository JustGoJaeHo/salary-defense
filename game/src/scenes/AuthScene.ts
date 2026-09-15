import Phaser from 'phaser'

export class AuthScene extends Phaser.Scene {
  constructor() {
    super('Auth')
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1d2230')

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 120, 'Salary Defense', {
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.createLoginButton()
    this.createSignupButton()
  }

  private createLoginButton(): void {
    const width = 160
    const height = 52
    const x = this.scale.width / 2
    const y = this.scale.height / 2

    const background = this.add.rectangle(x, y, width, height, 0x2ecc71, 0.9)
    background.setStrokeStyle(1, 0x4a5468)
    background.setInteractive({ useHandCursor: true })
    background.on('pointerdown', () => this.scene.start('Lobby'))

    this.add.text(x, y, '로그인', { fontSize: '20px', color: '#0f1115' }).setOrigin(0.5)
  }

  private createSignupButton(): void {
    const width = 160
    const height = 52
    const x = this.scale.width / 2
    const y = this.scale.height / 2 + 72

    const background = this.add.rectangle(x, y, width, height, 0x2f3644, 0.9)
    background.setStrokeStyle(1, 0x4a5468)
    background.setInteractive({ useHandCursor: true })
    background.on('pointerdown', () => console.log('회원가입 미구현'))

    this.add.text(x, y, '회원가입', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5)
  }
}
