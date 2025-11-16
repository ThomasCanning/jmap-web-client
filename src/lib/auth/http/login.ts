import { parseHttpError } from "../../shared/utils/error-handling"
import { authFetch } from "../../shared/http/authFetch"

export interface LoginResponse {
  success: boolean
}

export async function postLogin(username: string, password: string): Promise<LoginResponse> {
  const response = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const errorMessage = await parseHttpError(response)
    throw new Error(errorMessage)
  }

  return response.json() as Promise<LoginResponse>
}
