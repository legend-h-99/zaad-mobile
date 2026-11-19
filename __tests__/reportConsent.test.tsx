import { useState } from 'react'
import { Switch, Text } from 'react-native'
import renderer, { act } from 'react-test-renderer'
import { mapReportRow } from '../src/lib/report-row'
import { ReportUrgentFlags } from '../src/components/ReportUrgentFlags'
import { ReportConsent } from '../src/components/ReportConsent'

// React 19 requires the act environment for renderer updates.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

test('discloses third-party processing and requires an explicit opt-in', async () => {
  function Form() {
    const [value, setValue] = useState(false)
    return <ReportConsent value={value} onChange={setValue} />
  }
  let tree!: renderer.ReactTestRenderer
  await act(async () => { tree = renderer.create(<Form />) })
  expect(tree.root.findByType(Switch).props.value).toBe(false)
  expect(tree.root.findAllByType(Text).map(node => node.props.children).join(' ')).toContain('Anthropic')
  expect(tree.root.findAllByType(Text).map(node => node.props.children).join(' ')).toContain('Supabase')
  await act(async () => { tree.root.findByType(Switch).props.onValueChange(true) })
  expect(tree.root.findByType(Switch).props.value).toBe(true)
  await act(async () => { tree.unmount() })
})

test('renders urgent warnings from the backend persistence envelope even without an assessment', async () => {
  const report = mapReportRow({ id: 'r', user_id: 'u', created_at: '2026-11-19', status: 'done', extracted_values: { potassium: 6.5 },
    ai_assessment: { flags: [{ key: 'potassium', value: 6.5, unit: 'mmol/L', status: 'see_doctor', label_ar: 'البوتاسيوم مرتفع', advice_ar: 'راجع طبيبك' }], nutritionRestrictions: ['low_potassium'], urgentFlags: ['راجع طبيبك'], summaryAr: 'ملخص' },
    nutrition_flags: { restrictions: ['low_potassium'], urgent: ['راجع طبيبك'] } })
  let tree!: renderer.ReactTestRenderer
  await act(async () => { tree = renderer.create(<ReportUrgentFlags report={report} />) })
  expect(tree.root.findByType(Text).props.children).toBe('راجع طبيبك')
  expect(report.aiAssessment?.flags[0].labelAr).toBe('البوتاسيوم مرتفع')
  await act(async () => { tree.update(<ReportUrgentFlags report={{ ...report, aiAssessment: null }} />) })
  expect(tree.root.findByType(Text).props.children).toBe('راجع طبيبك')
  await act(async () => { tree.unmount() })
})
