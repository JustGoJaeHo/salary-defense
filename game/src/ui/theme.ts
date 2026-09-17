// 중립 그래파이트 배경 + 신뢰감 있는 블루 액센트로 구성한 사무적·모던 팔레트.
export const COLORS = {
  background: 0x14171d,
  surface: 0x1a1e25,
  surfaceAlt: 0x242932,
  border: 0x333a45,
  accent: 0x3b6ff2,
} as const

export const TEXT_COLORS = {
  primary: '#eef1f6',
  muted: '#8891a0',
  link: '#6ea3ff',
  danger: '#f0575c',
  success: '#2ecc8f',
  onAccent: '#ffffff',
} as const

// 타워/적/투사체 등 플레이 화면 전용 색상. 급여(투사체)로 지출(적)을 막아내는 구도를 색으로 드러낸다.
export const GAME_COLORS = {
  tower: 0x3b6ff2,
  enemy: 0xef4a63,
  projectile: 0xf4b740,
  path: 0x2b313c,
  placement: 0x3b6ff2,
} as const

export const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif'
