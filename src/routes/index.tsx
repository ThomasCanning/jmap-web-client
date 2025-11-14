import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLogin } from '@/lib/auth'

export const Route = createFileRoute('/')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authServerUrl, setAuthServerUrl] = useState('')
  const [validationErrors, setValidationErrors] = useState<{ 
    email?: string
    password?: string
    authServerUrl?: string
  }>({})

  const loginMutation = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Custom validation
    const errors: { email?: string; password?: string; authServerUrl?: string } = {}
    if (!email.trim()) {
      errors.email = 'Email is required'
    }
    if (!password) {
      errors.password = 'Password is required'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})

    loginMutation.mutate({ email, password, authServerUrl: authServerUrl.trim() || undefined })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">JMAP Login</h1>
          <p className="text-muted-foreground">Sign in to your JMAP server</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pb-6">
              {loginMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {loginMutation.error instanceof Error
                      ? loginMutation.error.message
                      : 'Login failed'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  disabled={loginMutation.isPending}
                  placeholder="user@example.com"
                  autoComplete="email"
                  aria-invalid={!!validationErrors.email}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: undefined }))
                    }
                  }}
                  disabled={loginMutation.isPending}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!validationErrors.password}
                />
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authServerUrl">Auth Server URL (optional)</Label>
                <Input
                  id="authServerUrl"
                  type="url"
                  value={authServerUrl}
                  onChange={(e) => {
                    setAuthServerUrl(e.target.value)
                    if (validationErrors.authServerUrl) {
                      setValidationErrors((prev) => ({ ...prev, authServerUrl: undefined }))
                    }
                  }}
                  disabled={loginMutation.isPending}
                  placeholder="https://api.jmapbox.com"
                  autoComplete="url"
                  aria-invalid={!!validationErrors.authServerUrl}
                />
                {validationErrors.authServerUrl && (
                  <p className="text-sm text-destructive">{validationErrors.authServerUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default server URL. The JMAP session URL will be auto-discovered from your email domain.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                type="submit" 
                disabled={loginMutation.isPending} 
                className="w-full"
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}