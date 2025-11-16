import type { Session } from "../../shared/types"
import { parseHttpError } from "../../shared/utils/error-handling"
import { authFetch } from "../../shared/http/authFetch"

export async function getSession(): Promise<Session> {
  const response = await authFetch("/jmap/session", {
    method: "GET",
  })

  if (!response.ok) {
    const errorMessage = await parseHttpError(response)
    throw new Error(errorMessage)
  }

  return response.json() as Promise<Session>
}
