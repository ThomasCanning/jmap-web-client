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
      //Cancel queries to prevent page you're on refetching without auth and failing
      queryClient.cancelQueries()
      queryClient.clear()
      navigate({ to: '/' })
    },
  })
}
