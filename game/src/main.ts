import './style.css'
import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 960,
  height: 540,
  backgroundColor: '#1d2230',
  scene: MainScene,
})
