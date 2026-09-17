import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload(): void {
    // 게임에서 사용할 이미지/사운드 asset은 이 메서드에서 this.load로 등록한다
  }

  create(): void {
    this.scene.start('Splash')
  }
}
