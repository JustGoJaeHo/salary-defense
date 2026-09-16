import type { AuthSession } from '../auth/session'

const API_BASE_URL = 'http://localhost:8081/api'

export class UnauthorizedError extends Error {}

export async function loginAsGuest(): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/auth/guest`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('게스트 로그인에 실패했습니다.')
  }

  return response.json()
}

export async function fetchGoogleLinkTicket(token: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/google/ticket`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (response.status === 401) {
    throw new UnauthorizedError('로그인이 만료되었습니다. 다시 로그인해주세요.')
  }

  if (!response.ok) {
    throw new Error('구글 연동 티켓 발급에 실패했습니다.')
  }

  const data = (await response.json()) as { ticket: string }
  return data.ticket
}

export function getGoogleRedirectUrl(ticket?: string): string {
  const url = new URL(`${API_BASE_URL}/auth/google/redirect`)
  if (ticket) {
    url.searchParams.set('ticket', ticket)
  }

  return url.toString()
}
