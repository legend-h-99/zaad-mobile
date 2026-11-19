import { Text } from 'react-native'
import type { LabReport } from '../types'

export function ReportUrgentFlags({ report }: { report: LabReport }) {
  const urgent = [...new Set([...(report.aiAssessment?.urgentFlags ?? []), ...(report.nutritionFlags?.urgent ?? [])])]
  return urgent.length ? <Text accessibilityRole="alert">{urgent.join(' · ')}</Text> : null
}
