import { useQuery } from '@tanstack/react-query'
import { getSession } from '../services/session'
import type { Session } from '../../shared/types'

export interface UseSessionOptions {
  enabled?: boolean
  retry?: boolean | number
}

export function useSession(options?: UseSessionOptions) {
  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: () => getSession(),
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? false,
  })
}

//I want to change this. I want to have a very clean lib setup that allows the following functionality in order to make my jmap client compatable with other jmap servers. I can from a component call a useSession hook which will give me a session object. Under the hood, this will do the following. It needs to know what session url to use. If this has been stored somewhere so far, use it (fetch from session storage ), if not, use autodiscovery. Then, we need to pass in authentication. We should have auth (make the page that uses session a protected route, this is a thing in tanstack router). However we want to support different ways of doing auth. These are the only w ways I want to support auth. 1. Call auth/token passing in the username and password, the server will set access token (access_token) and refresh token (refresh_token) http only cookies which will then be used for auth. 2. If that didn't work, call jmap/session using basic auth, the server should set access token (access_token) and refresh token (refresh_token) http only cookies which will then be used for auth 3. 