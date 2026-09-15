import './style.css'
import Phaser from 'phaser'
import { PreloadScene } from './scenes/PreloadScene'
import { AuthScene } from './scenes/AuthScene'
import { LobbyScene } from './scenes/LobbyScene'
import { MainScene } from './scenes/MainScene'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#1d2230',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 540,
    height: 960,
  },
  scene: [PreloadScene, AuthScene, LobbyScene, MainScene],
})
