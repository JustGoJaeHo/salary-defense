import { API_BASE_URL } from '../config'

export interface StageLevel {
  id: number
  key: string
  name: string
  sortOrder: number
  unlocked: boolean
  cleared: boolean
}

export interface Stage {
  id: number
  key: string
  name: string
  sortOrder: number
  unlocked: boolean
  levels: StageLevel[]
}

interface StageLevelResponse {
  id: number
  key: string
  name: string
  sort_order: number
  unlocked: boolean
  cleared: boolean
}

interface StageResponse {
  id: number
  key: string
  name: string
  sort_order: number
  unlocked: boolean
  levels: StageLevelResponse[]
}

export async function fetchStages(token: string): Promise<Stage[]> {
  const response = await fetch(`${API_BASE_URL}/stages`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('맵 목록을 불러오지 못했습니다.')
  }

  const stages = (await response.json()) as StageResponse[]

  return stages.map((stage) => ({
    id: stage.id,
    key: stage.key,
    name: stage.name,
    sortOrder: stage.sort_order,
    unlocked: stage.unlocked,
    levels: stage.levels.map((level) => ({
      id: level.id,
      key: level.key,
      name: level.name,
      sortOrder: level.sort_order,
      unlocked: level.unlocked,
      cleared: level.cleared,
    })),
  }))
}
