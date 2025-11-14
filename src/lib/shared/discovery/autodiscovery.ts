import { getSRVRecord } from './dns'
import { isCorsError } from '../utils/error-handling'

const extractDomain = (email: string): string | null => {
  const match = email.match(/@(.+)$/)
  return match ? match[1] : null
}

export async function discoverJmapServer(email: string): Promise<string | null> {
  const domain = extractDomain(email)
  if (!domain) {
    return null
  }

  const srvRecord = await getSRVRecord(domain)
  if (srvRecord) {
    const portSuffix = srvRecord.port === 443 ? '' : `:${srvRecord.port}`
    const wellKnownUrl = `https://${srvRecord.hostname}${portSuffix}/.well-known/jmap`
    const response = await fetch(wellKnownUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      redirect: 'follow',
    })
    if (response.ok || response.status === 401 || response.status === 403) {
      const finalUrl = new URL(response.url)
      return `${finalUrl.protocol}//${finalUrl.host}`
    }
    throw new Error(`Failed to get JMAP session from ${wellKnownUrl}: ${response.statusText}`)
  }

  const wellKnownUrl = `https://${domain}/.well-known/jmap`
  
  try {
    const response = await fetch(wellKnownUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      redirect: 'follow',
    })

    if (response.ok || response.status === 401 || response.status === 403) {
      const finalUrl = new URL(response.url)
      return `${finalUrl.protocol}//${finalUrl.host}`
    }
  } catch (error) {
    if (isCorsError(error)) {
      throw new Error(
        'CORS error: The JMAP server must allow requests from this client. ' +
        'Please configure CORS on your server to allow this origin: ' +
        window.location.origin
      )
    }
  }

  return null
}
