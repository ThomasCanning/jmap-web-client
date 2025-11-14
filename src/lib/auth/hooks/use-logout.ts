import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { logout } from '../services/logout'

export interface UseLogoutOptions {
  onSuccess?: () => void
}

export function useLogout(options?: UseLogoutOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      options?.onSuccess?.()
      navigate({ to: '/' })
    },
  })
}
