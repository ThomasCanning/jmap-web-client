/**
 * Session URL Storage
 * 
 * Stores the discovered JMAP session URL in a cookie.
 * This is discovered after authentication using the JMAP spec:
 * 1. Check SRV record for the email domain
 * 2. If not found, attempt .well-known/jmap endpoint on the domain
 */

const SESSION_URL_COOKIE_NAME = 'jmap_session_url'

/**
 * Gets the stored session URL from cookies
 */
export const getStoredSessionUrl = (): string | null => {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === SESSION_URL_COOKIE_NAME) {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Stores the session URL in a cookie
 */
export const storeSessionUrl = (url: string): void => {
  // Set cookie with 7 day expiration
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 7)
  document.cookie = `${SESSION_URL_COOKIE_NAME}=${encodeURIComponent(url)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`
}

/**
 * Clears the stored session URL cookie
 */
export const clearStoredSessionUrl = (): void => {
  document.cookie = `${SESSION_URL_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

