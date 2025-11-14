import { getSession as getSessionHttp } from '../http/session'
import { getStoredSessionUrl } from '../../shared/storage/session-url'
import { logout } from '../../auth/services/logout'
import type { Session } from '../../shared/types'

export async function getSession(): Promise<Session> {
  // Get session URL from cookie (set during login after discovery)
  const sessionUrl = getStoredSessionUrl()
  
  if (!sessionUrl) {
    // Session URL cookie is missing - user needs to login again
    await logout()
    window.location.href = '/'
    return new Promise(() => {}) // Never resolves, redirects to login
  }

  try {
    const session = await getSessionHttp(sessionUrl, {
      credentials: 'include',
    })
    return session
  } catch (error) {
    if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
      // Authentication failed - clear session and redirect to login
      await logout()
      window.location.href = '/'
      return new Promise(() => {}) // Never resolves, redirects to login
    }
    throw error
  }
}

