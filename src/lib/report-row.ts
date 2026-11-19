import type { LabReport, LabAssessment, LabFlag, LabValues } from '../types'

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}
function values(value: unknown): value is LabValues {
  return object(value) && Object.values(value).every(item => typeof item === 'number' && Number.isFinite(item))
}
function mapFlag(flag: unknown): LabFlag {
  if (!object(flag) || !['normal', 'watch', 'nutrition_risk', 'see_doctor'].includes(String(flag.status))
    || typeof flag.value !== 'number' || !Number.isFinite(flag.value)
    || !['key', 'unit', 'label_ar', 'advice_ar'].every(key => typeof flag[key] === 'string')) {
    throw new Error('Invalid report flag')
  }
  return { key: flag.key as string, value: flag.value, unit: flag.unit as string,
    status: flag.status as LabFlag['status'], labelAr: flag.label_ar as string, adviceAr: flag.advice_ar as string }
}
export function mapReportRow(row: unknown): LabReport {
  if (!object(row) || typeof row.id !== 'string' || typeof row.user_id !== 'string'
    || typeof row.created_at !== 'string' || !['processing', 'done', 'error'].includes(String(row.status))) {
    throw new Error('Invalid report row')
  }
  if (row.extracted_values != null && !values(row.extracted_values)) throw new Error('Invalid report values')
  let nutritionFlags: LabReport['nutritionFlags'] = null
  if (row.nutrition_flags != null) {
    if (!object(row.nutrition_flags) || !strings(row.nutrition_flags.restrictions) || !strings(row.nutrition_flags.urgent)) {
      throw new Error('Invalid nutrition flags')
    }
    nutritionFlags = { restrictions: row.nutrition_flags.restrictions, urgent: row.nutrition_flags.urgent }
  }
  let aiAssessment: LabAssessment | null = null
  if (row.ai_assessment != null) {
    const stored = row.ai_assessment
    if (!object(stored) || !Array.isArray(stored.flags) || !strings(stored.nutritionRestrictions)
      || !strings(stored.urgentFlags) || typeof stored.summaryAr !== 'string') throw new Error('Invalid report assessment')
    aiAssessment = { values: row.extracted_values == null ? {} : row.extracted_values as LabValues,
      flags: stored.flags.map(mapFlag), nutritionRestrictions: stored.nutritionRestrictions,
      urgentFlags: stored.urgentFlags, summaryAr: stored.summaryAr }
  }
  const optionalString = (key: string) => {
    if (row[key] == null) return undefined
    if (typeof row[key] !== 'string') throw new Error('Invalid report field')
    return row[key]
  }
  return { id: row.id, userId: row.user_id, createdAt: row.created_at,
    status: row.status as LabReport['status'], reportDate: optionalString('report_date'), fileUrl: optionalString('file_url'),
    fileName: optionalString('file_name'), rawText: optionalString('raw_text'), aiAssessment,
    extractedValues: row.extracted_values == null ? null : row.extracted_values as LabValues, nutritionFlags }
}
