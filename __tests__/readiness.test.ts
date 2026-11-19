import { mapReportRow } from '../src/lib/report-row'
import { recoveryTokens } from '../src/lib/recovery'
import { saudiDateKey, saudiDaysAgo } from '../src/lib/calendar'

// Matches SupabaseLabReportRepository.saveAnalyzedReport persistence fields in the web backend.
const row = { id: 'report', user_id: 'owner', created_at: '2026-11-19', status: 'done', file_name: 'lab.pdf', report_date: '2026-11-18', file_url: 'private', raw_text: 'text', extracted_values: { hba1c: 7 }, nutrition_flags: { restrictions: ['low_sugar'], urgent: ['راجع طبيبك'] }, ai_assessment: { flags: [{ key: 'hba1c', value: 7, unit: '%', status: 'see_doctor', label_ar: 'سكر', advice_ar: 'راجع طبيبك' }], nutritionRestrictions: [], urgentFlags: ['راجع طبيبك'], summaryAr: 'ملخص' } }

test('maps stored report fields and retains clinical assessment and urgent flags', () => {
  expect(mapReportRow(row)).toEqual({ id: 'report', userId: 'owner', createdAt: '2026-11-19', status: 'done', fileName: 'lab.pdf', reportDate: '2026-11-18', fileUrl: 'private', rawText: 'text', extractedValues: row.extracted_values, nutritionFlags: row.nutrition_flags, aiAssessment: { ...row.ai_assessment, values: row.extracted_values, flags: [{ key: 'hba1c', value: 7, unit: '%', status: 'see_doctor', labelAr: 'سكر', adviceAr: 'راجع طبيبك' }] } })
})
test('preserves unavailable nullable results without inventing assessment', () => {
  expect(mapReportRow({ ...row, ai_assessment: null, extracted_values: null, nutrition_flags: null })).toMatchObject({ aiAssessment: null, extractedValues: null, nutritionFlags: null })
})
test.each([
  { ...row, user_id: 4 }, { ...row, ai_assessment: { ...row.ai_assessment, urgentFlags: [42] } },
  { ...row, ai_assessment: { ...row.ai_assessment, flags: [{ ...row.ai_assessment.flags[0], status: 'invented' }] } },
  { ...row, extracted_values: { hba1c: '7' } }, { ...row, nutrition_flags: [7] },
  { ...row, file_name: 7 }, { ...row, status: 'unknown' },
])('rejects malformed database payload %#', invalid => expect(() => mapReportRow(invalid)).toThrow())

test('accepts only configured native recovery callback and recovery flow', () => {
  expect(recoveryTokens('zaad://reset-password#type=recovery&access_token=test-access&refresh_token=test-refresh')).toEqual({ access_token: 'test-access', refresh_token: 'test-refresh' })
})
test.each([
  'https://evil.test/reset-password#type=recovery&access_token=a&refresh_token=b',
  'zaad://reset-password/extra#type=recovery&access_token=a&refresh_token=b',
  'zaad://login#type=recovery&access_token=a&refresh_token=b',
  'zaad://reset-password#type=signup&access_token=a&refresh_token=b',
  'zaad://reset-password?next=evil#type=recovery&access_token=a&refresh_token=b',
  'zaad://reset-password#type=recovery&access_token=a&access_token=b&refresh_token=c',
  'zaad://reset-password#type=recovery&access_token=a', 'not a url',
])('rejects untrusted or incomplete callback %#', url => expect(recoveryTokens(url)).toBeNull())

test('uses the Saudi date across UTC midnight gap and calendar/year boundary', () => {
  expect(saudiDateKey(new Date('2026-11-18T20:59:59Z'))).toBe('2026-11-18')
  expect(saudiDateKey(new Date('2026-11-18T21:00:00Z'))).toBe('2026-11-19')
  expect(saudiDateKey(new Date('2026-12-31T21:00:00Z'))).toBe('2027-01-01')
  expect(saudiDaysAgo(7, new Date('2027-01-01T00:00:00+03:00'))).toBe('2026-12-25')
})
