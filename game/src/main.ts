import './style.css'
import Phaser from 'phaser'
import { PreloadScene } from './scenes/PreloadScene'
import { SplashScene } from './scenes/SplashScene'
import { AuthScene } from './scenes/AuthScene'
import { LobbyScene } from './scenes/LobbyScene'
import { StageScene, STAGE_KEYS } from './scenes/StageScene'
import { MainScene } from './scenes/MainScene'
import { TransitionScene } from './scenes/TransitionScene'
import { COLORS } from './ui/theme'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: COLORS.background,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 540,
    height: 960,
  },
  scene: [
    PreloadScene,
    SplashScene,
    AuthScene,
    LobbyScene,
    ...STAGE_KEYS.map((stageKey) => new StageScene(stageKey)),
    MainScene,
    TransitionScene,
  ],
})
