import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'

let root: string
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'zaad-env-readiness-'))
  fs.mkdirSync(path.join(root, 'scripts'))
  fs.copyFileSync(path.join(__dirname, '../scripts/run-expo-env.js'), path.join(root, 'scripts/run-expo-env.js'))
  fs.mkdirSync(path.join(root, 'node_modules/.bin'), { recursive: true })
  fs.writeFileSync(path.join(root, 'node_modules/.bin/expo'), '#!/usr/bin/env node\nrequire("fs").writeFileSync("capture.json", JSON.stringify({api: process.env.EXPO_PUBLIC_API_URL, dotenv: process.env.EXPO_NO_DOTENV}))', { mode: 0o755 })
})
afterEach(() => fs.rmSync(root, { recursive: true, force: true }))
function run(overrides: Record<string, string> = {}, mode = 'production') {
  return spawnSync(process.execPath, ['scripts/run-expo-env.js', mode, 'export'], { cwd: root, encoding: 'utf8', env: { NODE_ENV: 'test', PATH: process.env.PATH, EXPO_PUBLIC_API_URL: 'https://api.synthetic.test', EXPO_PUBLIC_SUPABASE_URL: 'https://db.synthetic.test', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-key', ...overrides } })
}
test('environment-only CI builds work and host values override local files', () => {
  expect(run().status).toBe(0)
  fs.writeFileSync(path.join(root, '.env.production.local'), 'EXPO_PUBLIC_API_URL=https://file.synthetic.test\n')
  expect(run().status).toBe(0)
  expect(JSON.parse(fs.readFileSync(path.join(root, 'capture.json'), 'utf8'))).toEqual({ api: 'https://api.synthetic.test', dotenv: '1' })
})
test('never loads an example file as runtime configuration', () => {
  fs.writeFileSync(path.join(root, '.env.production.example'), 'EXPO_PUBLIC_API_URL=https://file.synthetic.test\n')
  expect(run({ EXPO_PUBLIC_API_URL: '' }).status).not.toBe(0)
  expect(fs.existsSync(path.join(root, 'capture.json'))).toBe(false)
})
test.each(['http://api.synthetic.test', 'https://localhost', 'https://127.0.0.1', 'https://10.0.0.2', 'https://[::1]', 'https://api.local', 'https://api.example', 'https://u:p@api.synthetic.test', 'https://api.synthetic.test?token=secret', 'invalid'])('rejects unsafe production endpoint %s without starting Expo', endpoint => {
  expect(run({ EXPO_PUBLIC_API_URL: endpoint }).status).not.toBe(0)
  expect(fs.existsSync(path.join(root, 'capture.json'))).toBe(false)
})
test('also validates Supabase and staging values', () => {
  expect(run({ EXPO_PUBLIC_SUPABASE_URL: 'http://db.synthetic.test' }, 'staging').status).not.toBe(0)
  expect(run({ EXPO_PUBLIC_SUPABASE_ANON_KEY: '' }).status).not.toBe(0)
  expect(run({}, 'unknown').status).not.toBe(0)
})
