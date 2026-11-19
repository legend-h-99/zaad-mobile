import { remoteApiEndpoint } from '../src/lib/api/endpoint'

test('allows HTTPS remote origins and path prefixes', () => {
  expect(remoteApiEndpoint('https://api.synthetic.test/prefix/')).toBe('https://api.synthetic.test/prefix')
})
test.each(['', 'invalid', 'http://api.synthetic.test', 'ftp://api.synthetic.test', 'https:api.synthetic.test',
  'https://localhost', 'https://LOCALHOST.', 'https://sub.localhost', 'https://api.local', 'https://api.internal',
  'https://127.0.0.1', 'https://127.1', 'https://2130706433', 'https://0x7f000001', 'https://10.0.0.1',
  'https://192.168.1.1', 'https://172.16.0.1', 'https://[::1]', 'https://[::ffff:127.0.0.1]',
  'https://user:pass@api.synthetic.test', 'https://api.synthetic.test?key=x', 'https://api.synthetic.test#fragment'])('rejects unsafe runtime endpoint %#', value => {
  expect(() => remoteApiEndpoint(value)).toThrow('remote HTTPS')
})
test.each(['production', 'staging'])('fails closed for invalid endpoint in %s even outside build wrapper', mode => {
  const previous = { ...process.env }
  Object.assign(process.env, { NODE_ENV: 'test', EXPO_PUBLIC_APP_ENV: mode, EXPO_PUBLIC_API_URL: 'http://unsafe.synthetic.test' })
  try { expect(() => jest.isolateModules(() => jest.requireActual('../src/lib/api/config'))).toThrow('remote HTTPS') }
  finally { process.env = previous }
})
