import type { Session } from '../../shared/types'
import { parseHttpError } from '../../shared/utils/error-handling'
import { authenticatedFetch } from '../../auth/http/authenticated-fetch'

export async function getSession(
  serverUrl: string,
  options?: RequestInit
): Promise<Session> {
  const response = await authenticatedFetch(`${serverUrl}/.well-known/jmap`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorMessage = await parseHttpError(response)
    throw new Error(errorMessage)
  }

  return response.json() as Promise<Session>
}
