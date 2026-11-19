export function remoteApiEndpoint(value: string): string {
  const input = value.trim()
  let url: URL
  try { url = new URL(input) } catch { throw new Error('EXPO_PUBLIC_API_URL must be a remote HTTPS URL') }
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!/^https:\/\//i.test(input) || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
    || !host.includes('.') || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')
    || host.endsWith('.invalid') || host.endsWith('.example') || host.includes(':')
    || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    throw new Error('EXPO_PUBLIC_API_URL must be a remote HTTPS URL')
  }
  return url.toString().replace(/\/$/, '')
}
