import Phaser from 'phaser'
import { TRANSITION_SCENE_KEY } from './TransitionScene'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload(): void {
    // 게임에서 사용할 이미지/사운드 asset은 이 메서드에서 this.load로 등록한다
  }

  create(): void {
    // 화면 전환 오버레이 씬은 게임이 켜져 있는 동안 계속 떠 있어야 하므로 launch로 한 번만 띄운다
    this.scene.launch(TRANSITION_SCENE_KEY)
    this.scene.start('Splash')
  }
}
