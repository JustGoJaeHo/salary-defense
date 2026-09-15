import Phaser from 'phaser'

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super('Lobby')
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1d2230')

    this.add
      .text(this.scale.width / 2, 100, 'Salary Defense', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.createMenuButton(this.scale.height / 2 - 80, '게임시작', () => this.scene.start('Main'))
    this.createMenuButton(this.scale.height / 2, '랭킹', () => console.log('랭킹 미구현'))
    this.createMenuButton(this.scale.height / 2 + 80, '인벤토리', () => console.log('인벤토리 미구현'))
    this.createMenuButton(this.scale.height / 2 + 160, '이벤트', () => console.log('이벤트 미구현'))
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
}
