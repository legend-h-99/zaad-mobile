import { Platform } from 'react-native'
import { apiFetch } from '../src/lib/api/config'
import { generateMealPlan, askMealQuestion } from '../src/lib/api/meals'
import { uploadAndAnalyzeReport } from '../src/lib/api/reports'

const mockFetch = jest.fn()
const originalFetch = global.fetch
beforeEach(() => { global.fetch = mockFetch; mockFetch.mockReset() })
afterAll(() => { global.fetch = originalFetch })

test('authenticated requests preserve custom headers and attach the bearer token', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ result: true }) })
  await expect(apiFetch('/test', { method: 'POST', headers: { 'X-Test': 'value' } }, 'token')).resolves.toEqual({ result: true })
  expect(mockFetch).toHaveBeenCalledWith('/test', expect.objectContaining({ headers: { 'Content-Type': 'application/json', 'X-Test': 'value', Authorization: 'Bearer token' } }))
})

test('unauthenticated requests omit Authorization', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
  await apiFetch('/test')
  expect(mockFetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
})

test.each([true, false])('API errors retain the server message or use an HTTP fallback (%s)', async validJson => {
  mockFetch.mockResolvedValue({ ok: false, status: 503, statusText: 'Unavailable', json: async () => { if (!validJson) throw new Error('not json'); return { error: 'try later' } } })
  await expect(apiFetch('/test')).rejects.toThrow(validJson ? 'try later' : 'HTTP 503')
})

test('meal requests send their parameters and unwrap responses', async () => {
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ meals: { notes: 'plan' } }) })
  await expect(generateMealPlan({ date: '2026-11-18', accessToken: 'token' })).resolves.toEqual({ notes: 'plan' })
  expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ date: '2026-11-18' })
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ answer: 'answer' }) })
  await expect(askMealQuestion({ question: 'question', accessToken: 'token' })).resolves.toBe('answer')
})

test('native uploads use multipart data without overriding the boundary', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ reportId: 'report' }) })
  await expect(uploadAndAnalyzeReport({ uri: 'file://report.pdf', fileName: 'report.pdf', mimeType: 'application/pdf', accessToken: 'token' })).resolves.toEqual({ reportId: 'report' })
  expect(mockFetch.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer token' })
  expect(mockFetch.mock.calls[0][1].body).toBeInstanceOf(FormData)
})

test.each([true, false])('upload failures display useful errors (%s)', async validJson => {
  mockFetch.mockResolvedValue({ ok: false, status: 422, json: async () => { if (!validJson) throw new Error('not json'); return { error: 'unreadable' } } })
  await expect(uploadAndAnalyzeReport({ uri: 'file://report.pdf', fileName: 'report.pdf', mimeType: 'application/pdf', accessToken: 'token' })).rejects.toThrow(validJson ? 'unreadable' : 'HTTP 422')
})

test('web uploads fetch the selected blob before posting', async () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web')
  const originalFile = global.File
  global.File = class File extends Blob { name: string; lastModified = 0; webkitRelativePath = ''; constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) { super(parts, options); this.name = name } }
  mockFetch.mockResolvedValueOnce({ blob: async () => new Blob(['report']) }).mockResolvedValueOnce({ ok: true, json: async () => ({ reportId: 'web-report' }) })
  try {
    await expect(uploadAndAnalyzeReport({ uri: 'blob:report', fileName: 'report.pdf', mimeType: 'application/pdf', accessToken: 'token' })).resolves.toEqual({ reportId: 'web-report' })
    expect(mockFetch.mock.calls[0][0]).toBe('blob:report')
  } finally { platform.restore(); global.File = originalFile }
})

test('production API configuration preserves a valid remote path prefix', () => {
  const previous = { ...process.env }
  Object.assign(process.env, { NODE_ENV: 'production', EXPO_PUBLIC_API_URL: 'https://api.synthetic.test/prefix/' })
  try {
    jest.isolateModules(() => {
      const config = jest.requireActual('../src/lib/api/config')
      expect(config.API_BASE_URL).toBe('https://api.synthetic.test/prefix')
      expect(config.API_ROUTES.reportsAnalyze).toBe('https://api.synthetic.test/prefix/api/reports/analyze')
    })
  } finally { process.env = previous }
})
