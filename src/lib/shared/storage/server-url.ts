const SERVER_URL_STORAGE_KEY = 'jmap_server_url'

export const getStoredServerUrl = (): string | null => {
  return sessionStorage.getItem(SERVER_URL_STORAGE_KEY)
}

export const storeServerUrl = (url: string): void => {
  sessionStorage.setItem(SERVER_URL_STORAGE_KEY, url)
}

export const clearStoredServerUrl = (): void => {
  sessionStorage.removeItem(SERVER_URL_STORAGE_KEY)
}

export const getApiBaseUrl = (): string => {
  const stored = getStoredServerUrl()
  if (stored) {
    return stored
  }
  return import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin
}
