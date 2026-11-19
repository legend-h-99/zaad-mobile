const { isIP } = require('node:net')

/** @param {string} connectionString
 * @param {{ca?: string, allowInsecureLocal?: boolean}} options
 */
function databaseConnectionOptions(connectionString, { ca, allowInsecureLocal = false } = {}) {
  const url = new URL(connectionString)
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Expected a PostgreSQL URL.')
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  const local = ['localhost', '127.0.0.1', '::1'].includes(hostname)
  // pg otherwise lets URL options replace the verified SSL configuration.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslnegotiation']) url.searchParams.delete(key)
  const ssl = local && allowInsecureLocal ? false : {
    rejectUnauthorized: true,
    ...(isIP(hostname) ? {} : { servername: hostname }),
    ...(ca ? { ca } : {}),
  }
  return { connectionString: url.toString(), ssl }
}

module.exports = { databaseConnectionOptions }
