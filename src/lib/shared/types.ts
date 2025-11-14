export interface Session {
  apiUrl: string
  capabilities: Record<string, unknown>
  primaryAccounts: Record<string, string>
  [key: string]: unknown
}
