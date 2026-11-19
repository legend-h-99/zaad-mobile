import { databaseConnectionOptions } from '../scripts/database-tls.cjs'

test('remote database certificates and hostnames are verified', () => {
  const options = databaseConnectionOptions('postgres://user:password@db.example.com/db?sslmode=no-verify', { ca: 'trusted-ca' })
  expect(options.ssl).toEqual({ rejectUnauthorized: true, servername: 'db.example.com', ca: 'trusted-ca' })
  expect(options.connectionString).not.toContain('sslmode')
})

test('localhost inside a password or remote hostname cannot disable TLS', () => {
  for (const url of ['postgres://user:localhost@db.example.com/db', 'postgres://user:password@localhost.attacker.example/db']) {
    expect(databaseConnectionOptions(url, { allowInsecureLocal: true }).ssl).toMatchObject({ rejectUnauthorized: true })
  }
})

test('only explicit loopback connections may disable TLS', () => {
  expect(databaseConnectionOptions('postgres://localhost/db').ssl).toMatchObject({ rejectUnauthorized: true })
  expect(databaseConnectionOptions('postgres://127.0.0.1/db', { allowInsecureLocal: true }).ssl).toBe(false)
  expect(databaseConnectionOptions('postgres://[::1]/db', { allowInsecureLocal: true }).ssl).toBe(false)
})
