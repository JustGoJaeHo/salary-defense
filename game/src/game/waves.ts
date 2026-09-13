export interface WaveConfig {
  enemyCount: number
  spawnInterval: number
}

export const WAVES: WaveConfig[] = [
  { enemyCount: 5, spawnInterval: 1000 },
  { enemyCount: 8, spawnInterval: 800 },
  { enemyCount: 12, spawnInterval: 600 },
]
