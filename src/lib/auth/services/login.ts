/**
 * Authentication Service
 * 
 * This client uses a simple cookie-based authentication system:
 * 
 * 1. The client POSTs username and password to the auth/login endpoint
 * 2. The server sets access_token and refresh_token cookies
 * 3. After successful authentication, the client discovers the JMAP session URL using the email
 *    (following JMAP spec: check SRV record, then .well-known/jmap endpoint)
 * 4. The discovered session URL is stored in a cookie
 * 5. All subsequent requests automatically include these cookies (via credentials: 'include')
 * 6. No manual token management is required - the browser handles cookies automatically
 * 
 * To use this client with a different server:
 * - Ensure your server implements an auth/login endpoint that accepts POST requests with
 *   {"username": "...", "password": "..."} in the body
 * - The server should set HttpOnly cookies named access_token and refresh_token
 * - The server should return {"success": true} on success or {"error": "..."} on failure
 * - All other endpoints should validate the access_token cookie
 * - You may need to adjust the AUTH_LOGIN_ENDPOINT environment variable or config
 * - If your auth endpoint is not at /auth/login, configure AUTH_LOGIN_ENDPOINT in config.mk
 * - If you use a different auth schema (not cookie-based), you'll need to modify this service
 */

import { parseHttpError } from '../../shared/utils/error-handling'
import { getApiBaseUrl } from '../../shared/storage/server-url'
import { discoverJmapServer } from '../../shared/discovery/autodiscovery'
import { storeSessionUrl } from '../../shared/storage/session-url'

const AUTH_LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/auth/login'

export interface LoginResponse {
  success: boolean
  error?: string
}

export async function login(
  email: string,
  password: string,
  authServerUrl?: string
): Promise<void> {
  // Extract username from email (use email as username if no @ found)
  const username = email.includes('@') ? email.split('@')[0] : email
  
  // Use provided auth server URL or default
  const apiBaseUrl = authServerUrl || getApiBaseUrl()
  const loginUrl = `${apiBaseUrl}${AUTH_LOGIN_ENDPOINT}`

  // Step 1: Authenticate
  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: include cookies in request and response
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const errorMessage = await parseHttpError(response)
    throw new Error(errorMessage)
  }

  const result = (await response.json()) as LoginResponse

  if (!result.success) {
    throw new Error(result.error || 'Login failed')
  }

  // Step 2: Discover JMAP session URL from email (following JMAP spec)
  // 1. Check SRV record for domain
  // 2. If not found, attempt .well-known/jmap endpoint on domain
  const sessionUrl = await discoverJmapServer(email)
  
  if (!sessionUrl) {
    throw new Error('Could not discover JMAP session URL. Please ensure your email domain has a valid JMAP server configuration.')
  }

  // Step 3: Store discovered session URL in cookie
  storeSessionUrl(sessionUrl)
}
