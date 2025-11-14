export interface SRVRecord {
  hostname: string
  port: number
}

export const getSRVRecord = async (domain: string): Promise<SRVRecord | null> => {
  const srvName = `_jmap._tcp.${domain}`
  const dohUrl = `https://dns.google/resolve?name=${encodeURIComponent(srvName)}&type=SRV`
  
  try {
    const response = await fetch(dohUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json() as {
      Answer?: Array<{
        name: string
        type: number
        TTL: number
        data: string
      }>
    }
    
    if (!data.Answer || data.Answer.length === 0) {
      return null
    }
    
    const srvData = data.Answer[0].data
    const parts = srvData.split(' ')
    
    if (parts.length < 4) {
      return null
    }
    
    const port = parseInt(parts[2], 10)
    let hostname = parts[3]
    
    if (hostname.endsWith('.')) {
      hostname = hostname.slice(0, -1)
    }
    
    console.log('SRV record found:', { hostname, port })
    return {
      hostname,
      port,
    }
  } catch (error) {
    console.error('Failed to query SRV record:', error)
    return null
  }
}
