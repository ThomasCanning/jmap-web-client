import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { postLogout } from '../http/logout'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      return postLogout()
    },
    onSuccess: () => {
      queryClient.clear()
      navigate({ to: '/' })
    },
  })
}
