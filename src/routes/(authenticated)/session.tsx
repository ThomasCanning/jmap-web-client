import { createFileRoute } from '@tanstack/react-router'
import type { Session } from '@/lib/jmap'
import { useSession } from '@/lib/jmap'
import { useLogout } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Route = createFileRoute('/(authenticated)/session')({
  component: SessionPage,
})

function SessionPage() {
  const sessionQuery = useSession()

  const logoutMutation = useLogout()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">JMAP Session</h1>
          <p className="text-muted-foreground">View your JMAP session information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Fetch and display your current JMAP session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionQuery.isFetching && (
              <p className="text-sm text-muted-foreground">Loading session...</p>
            )}

            {sessionQuery.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {sessionQuery.error instanceof Error
                    ? sessionQuery.error.message
                    : 'Failed to fetch session'}
                </AlertDescription>
              </Alert>
            )}

            {sessionQuery.isSuccess && sessionQuery.data && (
              <SessionDisplay session={sessionQuery.data} />
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function SessionDisplay({ session }: { session: Session }) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">API URL:</span>{' '}
          <span className="text-muted-foreground">{session.apiUrl}</span>
        </div>
        <div>
          <span className="font-medium">Capabilities:</span>{' '}
          <span className="text-muted-foreground">
            {Object.keys(session.capabilities).length > 0
              ? Object.keys(session.capabilities).join(', ')
              : 'None'}
          </span>
        </div>
        <div>
          <span className="font-medium">Primary Accounts:</span>{' '}
          <span className="text-muted-foreground">
            {Object.keys(session.primaryAccounts).length > 0
              ? Object.keys(session.primaryAccounts).length
              : 'None'}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium mb-2">Raw Session Data:</p>
        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}
