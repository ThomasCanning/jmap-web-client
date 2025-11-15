import { useQuery } from '@tanstack/react-query'
import { getSession } from '../http/session'
import type { Session } from '../../shared/types'

// Shared query options for session - single source of truth
export const sessionQueryOptions = {
  queryKey: ['session'] as const,
  queryFn: () => getSession(),
  retry: false,
  staleTime: 5 * 60 * 1000, // 5 minutes - session data is considered fresh for 5 minutes
}

export function useSession() {
  return useQuery<Session>(sessionQueryOptions)
} 