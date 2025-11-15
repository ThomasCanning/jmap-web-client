import { parseHttpError } from '../../shared/utils/error-handling'
import { authFetch } from '../../shared/http/authFetch'

export async function postLogout(): Promise<void> {
  const response = await authFetch('/auth/logout', {
    method: 'POST',
  })

  if (!response.ok) {
    const errorMessage = await parseHttpError(response)
    throw new Error(errorMessage)
  }

  return
}

