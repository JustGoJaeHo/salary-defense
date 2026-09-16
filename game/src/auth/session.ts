export interface AuthUser {
  id: number
  name: string
  is_guest: boolean
}

export interface AuthSession {
  token: string
  user: AuthUser
}

const STORAGE_KEY = 'salary-defense-auth'

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}
