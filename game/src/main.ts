import './style.css'
import Phaser from 'phaser'

class MainScene extends Phaser.Scene {
  create() {
    this.cameras.main.setBackgroundColor('#1d2230')

    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Salary Defense', {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 960,
  height: 540,
  backgroundColor: '#1d2230',
  scene: MainScene,
})
