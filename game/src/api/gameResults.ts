import { API_BASE_URL } from '../config'

export interface GameResultPayload {
  levelId: number
  cleared: boolean
  waveReached: number
}

export async function submitGameResult(payload: GameResultPayload, token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/game-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      level_id: payload.levelId,
      cleared: payload.cleared,
      wave_reached: payload.waveReached,
    }),
  })
}
