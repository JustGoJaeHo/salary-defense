const API_BASE_URL = 'http://localhost:8081/api'

export interface GameResultPayload {
  nickname: string
  cleared: boolean
  waveReached: number
}

export async function submitGameResult(payload: GameResultPayload): Promise<void> {
  await fetch(`${API_BASE_URL}/game-results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nickname: payload.nickname,
      cleared: payload.cleared,
      wave_reached: payload.waveReached,
    }),
  })
}
