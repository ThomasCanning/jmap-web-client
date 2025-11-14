import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { login } from '../services/login'

export interface UseLoginOptions {
  onSuccess?: () => void
}

export function useLogin(options?: UseLoginOptions) {
  const navigate = useNavigate()

  return useMutation<void, Error, { email: string; password: string; authServerUrl?: string }>({
    mutationFn: async ({ email, password, authServerUrl }) => {
      return login(email, password, authServerUrl)
    },
    onSuccess: () => {
      options?.onSuccess?.()
      navigate({ to: '/session' })
    },
  })
}
