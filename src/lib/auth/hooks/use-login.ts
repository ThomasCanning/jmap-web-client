import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { postLogin, type LoginResponse } from "../http/login"

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, { username: string; password: string }>({
    mutationKey: ["login"],
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return postLogin(username, password)
    },
    onSuccess: (data: LoginResponse) => {
      if (data.success) {
        // Invalidate session query to refetch with new authentication
        void queryClient.invalidateQueries({ queryKey: ["session"] })
        void navigate({ to: "/session" })
      }
    },
  })
}
