import { LabAssessment } from '../../types'
import { API_ROUTES } from './config'
import { Platform } from 'react-native'

export interface UploadReportParams {
  uri: string
  fileName: string
  mimeType: string
  accessToken: string
}

export interface AnalyzeReportResponse {
  assessment: LabAssessment
  reportId: string
}

/**
 * Upload a lab report image/PDF to the server for Claude AI analysis.
 * Uses multipart/form-data — same endpoint as the web app.
 */
export async function uploadAndAnalyzeReport(
  params: UploadReportParams,
): Promise<AnalyzeReportResponse> {
  const formData = new FormData()

  if (Platform.OS === 'web') {
    const fileResponse = await fetch(params.uri)
    const fileBlob = await fileResponse.blob()
    formData.append(
      'file',
      new File([fileBlob], params.fileName, { type: params.mimeType }),
    )
  } else {
    // React Native FormData accepts an object with uri/name/type.
    formData.append('file', {
      uri: params.uri,
      name: params.fileName,
      type: params.mimeType,
    } as unknown as Blob)
  }

  const response = await fetch(API_ROUTES.reportsAnalyze, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      // Do NOT set Content-Type — let fetch set it with the boundary
    },
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      (body as { error?: string }).error ??
      `تعذر تحليل التقرير — HTTP ${response.status}`,
    )
  }

  return response.json()
}
