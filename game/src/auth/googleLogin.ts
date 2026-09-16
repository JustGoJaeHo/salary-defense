import { getGoogleRedirectUrl } from '../api/auth'
import type { AuthSession, AuthUser } from './session'

const API_ORIGIN = 'http://localhost:8081'

interface GoogleAuthMessage {
  type: 'google-auth'
  success: boolean
  token?: string
  user?: AuthUser
  message?: string
}

function isGoogleAuthMessage(data: unknown): data is GoogleAuthMessage {
  return typeof data === 'object' && data !== null && (data as { type?: unknown }).type === 'google-auth'
}

export function openGoogleLoginPopup(ticket?: string): Promise<AuthSession> {
  return new Promise((resolve, reject) => {
    const popup = window.open(getGoogleRedirectUrl(ticket), 'google-login', 'width=480,height=640')

    if (!popup) {
      reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'))
      return
    }

    const cleanup = () => {
      window.removeEventListener('message', handleMessage)
      window.clearInterval(popupCheck)
    }

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== API_ORIGIN || !isGoogleAuthMessage(event.data)) {
        return
      }

      cleanup()

      if (event.data.success && event.data.token && event.data.user) {
        resolve({ token: event.data.token, user: event.data.user })
      } else {
        reject(new Error(event.data.message ?? '구글 로그인에 실패했습니다.'))
      }
    }

    window.addEventListener('message', handleMessage)

    const popupCheck = window.setInterval(() => {
      let isClosed: boolean
      try {
        isClosed = popup.closed
      } catch {
        // Cross-origin COOP restrictions can block reading `.closed`; give up
        // detecting manual cancellation and rely on postMessage instead.
        window.clearInterval(popupCheck)
        return
      }

      if (isClosed) {
        cleanup()
        reject(new Error('로그인이 취소되었습니다.'))
      }
    }, 500)
  })
}
