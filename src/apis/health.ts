import { CareCode } from './interceptor'
import {
  Attachment,
  attachmentListSchema,
  attachmentSchema,
  CreateHealthRecordBody,
  createHealthRecordBodySchema,
  HealthAlert,
  HealthRecommendation,
  healthRecommendationSchema,
  healthAlertListSchema,
  HealthRecord,
  healthRecordListSchema,
  healthRecordSchema,
  RecordType,
  UpdateHealthRecordBody,
  updateHealthRecordBodySchema,
} from '@/types/apis/health'

// POST /health/records
export const postHealthRecord = async (body: CreateHealthRecordBody): Promise<HealthRecord> => {
  const parsedBody = createHealthRecordBodySchema.parse(body)
  const res = await CareCode.post('/health/records', parsedBody)
  return healthRecordSchema.parse(res.data)
}

// GET /health/records/{recordId}
export const getHealthRecord = async (recordId: number): Promise<HealthRecord> => {
  const res = await CareCode.get(`/health/records/${recordId}`)
  return healthRecordSchema.parse(res.data)
}

// GET /health/records/user/{userId}
export const getUserHealthRecords = async (userId: string): Promise<HealthRecord[]> => {
  const res = await CareCode.get(`/health/records/user/${userId}`)
  return healthRecordListSchema.parse(res.data)
}

// GET /health/records/type - 아이별 기록 타입 필터
export const getHealthRecordsByType = async (
  childId: number,
  recordType: RecordType,
): Promise<HealthRecord[]> => {
  const res = await CareCode.get('/health/records/type', { params: { childId, recordType } })
  return healthRecordListSchema.parse(res.data)
}

// PUT /health/records/{recordId}
export const putHealthRecord = async (
  recordId: number,
  body: UpdateHealthRecordBody,
): Promise<HealthRecord> => {
  const parsedBody = updateHealthRecordBodySchema.parse(body)
  const res = await CareCode.put(`/health/records/${recordId}`, parsedBody)
  return healthRecordSchema.parse(res.data)
}

// DELETE /health/records/{recordId}
export const deleteHealthRecord = async (recordId: number): Promise<void> => {
  await CareCode.delete(`/health/records/${recordId}`)
}

// ==================== 첨부파일 ====================

// GET /health/records/{recordId}/attachments
export const getAttachments = async (recordId: number): Promise<Attachment[]> => {
  const res = await CareCode.get(`/health/records/${recordId}/attachments`)
  return attachmentListSchema.parse(res.data)
}

// POST /health/records/{recordId}/attachments/upload - multipart 업로드
export const uploadAttachment = async (
  recordId: number,
  file: File,
  description?: string,
): Promise<Attachment> => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await CareCode.post(`/health/records/${recordId}/attachments/upload`, formData, {
    params: description ? { description } : {},
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return attachmentSchema.parse(res.data)
}

/**
 * GET /health/records/{recordId}/attachments/{attachmentId}/download
 *
 * 첨부 저장소는 정적으로 공개되지 않는다(민감정보). `<a href>` 나 `<img src>` 로는
 * 인증 헤더를 붙일 수 없어 401 이 나므로, 인증된 axios 로 본문을 받아 blob 으로 다룬다.
 */
export const downloadAttachment = async (recordId: number, attachmentId: number): Promise<Blob> => {
  const res = await CareCode.get(
    `/health/records/${recordId}/attachments/${attachmentId}/download`,
    { responseType: 'blob' },
  )
  return res.data as Blob
}

// DELETE /health/records/attachments/{attachmentId}
export const deleteAttachment = async (attachmentId: number): Promise<void> => {
  await CareCode.delete(`/health/records/attachments/${attachmentId}`)
}

// ==================== 알림 / 통계 ====================

// GET /health/alerts
export const getHealthAlerts = async (userId: string): Promise<HealthAlert[]> => {
  const res = await CareCode.get('/health/alerts', { params: { userId } })
  return healthAlertListSchema.parse(res.data)
}

// GET /health/recommendations - 아이 월령 기준 추천
export const getHealthRecommendations = async (): Promise<HealthRecommendation> => {
  const res = await CareCode.get('/health/recommendations')
  return healthRecommendationSchema.parse(res.data)
}
