import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { sessionQueryOptions } from '@/lib/jmap/hooks/use-session'

export const Route = createFileRoute('/(authenticated)')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(sessionQueryOptions)
    } catch {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: () => <Outlet />,
})

