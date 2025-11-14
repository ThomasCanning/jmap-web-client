/**
 * Makes an authenticated fetch request.
 * 
 * This client uses cookie-based authentication. All requests automatically include
 * cookies (access_token and refresh_token) that were set during login.
 * No manual token management is required.
 */
export async function authenticatedFetch(
  url: string | URL,
  options?: RequestInit
): Promise<Response> {
  // Always include credentials to send cookies with requests
  return fetch(url, {
    ...options,
    credentials: 'include',
  })
}
