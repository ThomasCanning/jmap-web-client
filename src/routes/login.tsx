import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLogin } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{ 
    username?: string
    password?: string
  }>({})

  const authLogin = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Custom validation
    const errors: { username?: string; password?: string } = {}
    if (!username.trim()) {
      errors.username = 'Username is required'
    }
    if (!password) {
      errors.password = 'Password is required'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})

    authLogin.mutate({ username, password })
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
              {authLogin.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {authLogin.error instanceof Error
                      ? authLogin.error.message
                      : 'Login failed'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (validationErrors.username) {
                      setValidationErrors((prev) => ({ ...prev, username: undefined }))
                    }
                  }}
                  disabled={authLogin.isPending}
                  placeholder="Enter your username"
                  autoComplete="username"
                  aria-invalid={!!validationErrors.username}
                />
                {validationErrors.username && (
                  <p className="text-sm text-destructive">{validationErrors.username}</p>
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
                  disabled={authLogin.isPending}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!validationErrors.password}
                />
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                type="submit" 
                disabled={authLogin.isPending} 
                className="w-full"
              >
                {authLogin.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

