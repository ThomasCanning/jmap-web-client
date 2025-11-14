import { clearStoredSessionUrl } from '../../shared/storage/session-url'

/**
 * Logs out the user by clearing the stored session URL cookie.
 * 
 * Note: Authentication cookies (access_token, refresh_token) are handled by the server.
 * This client clears the session URL cookie. The server should handle
 * cookie expiration/invalidation for auth cookies.
 */
export async function logout(): Promise<void> {
  clearStoredSessionUrl()
  // Auth cookies (access_token, refresh_token) are automatically cleared by the browser 
  // when they expire or are invalidated by the server
}
