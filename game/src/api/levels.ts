import { API_BASE_URL } from '../config'
import type { WaveConfig } from '../game/waves'

export interface LevelDetail {
  id: number
  key: string
  name: string
  waves: WaveConfig[]
}

export class LevelLockedError extends Error {}

export async function fetchLevel(levelId: number, token: string): Promise<LevelDetail> {
  const response = await fetch(`${API_BASE_URL}/levels/${levelId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (response.status === 403) {
    throw new LevelLockedError('아직 잠긴 게임입니다.')
  }

  if (!response.ok) {
    throw new Error('게임 정보를 불러오지 못했습니다.')
  }

  return response.json()
}
