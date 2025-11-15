import { useQuery } from '@tanstack/react-query'
import { getSession } from '../http/session'
import type { Session } from '../../shared/types'

export function useSession() {
  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: () => getSession(),
    retry: false,
  })
} 