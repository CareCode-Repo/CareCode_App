import { z } from 'zod'

/**
 * 서버 HealthRecord.RecordType 과 같은 목록. 한쪽에만 있으면 저장이 실패하거나(프런트에만 있을 때)
 * 코드가 그대로 찍히고 필터로 찾을 수 없다(서버에만 있을 때). 순서는 입력 칩에 보이는 순서다.
 */
export const RecordType = [
  'VACCINATION',
  'CHECKUP',
  'ILLNESS',
  'SYMPTOM',
  'MEDICATION',
  'GROWTH',
  'DENTAL',
  'EYE',
  'EMERGENCY',
  'OTHER',
] as const
export type RecordType = (typeof RecordType)[number]

export const RECORD_TYPE_LABEL: Record<RecordType, string> = {
  VACCINATION: '예방접종',
  CHECKUP: '건강검진',
  ILLNESS: '질병',
  SYMPTOM: '증상',
  MEDICATION: '투약',
  GROWTH: '성장',
  DENTAL: '치과',
  EYE: '안과',
  EMERGENCY: '응급',
  OTHER: '기타',
}

// 서버 HealthRecordResponse 대응 (childId/userId 는 문자열로 내려온다)
export const healthRecordSchema = z.object({
  id: z.number(),
  childId: z.string().nullish(),
  childName: z.string().nullish(),
  userId: z.string().nullish(),
  recordType: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  recordDate: z.string().nullish(), // yyyy-MM-dd
  nextDate: z.string().nullish(),
  location: z.string().nullish(),
  doctorName: z.string().nullish(),
  hospitalName: z.string().nullish(),
  height: z.number().nullish(),
  weight: z.number().nullish(),
  temperature: z.number().nullish(),
  bloodPressure: z.string().nullish(),
  pulseRate: z.number().nullish(),
  vaccineName: z.string().nullish(),
  isCompleted: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type HealthRecord = z.infer<typeof healthRecordSchema>
export const healthRecordListSchema = z.array(healthRecordSchema)

/**
 * 측정값은 모두 선택 입력이라 빈 문자열이 들어올 수 있어 undefined 로 정규화한다.
 * (빈 값을 그대로 보내면 서버 @DecimalMin 검증에 걸린다)
 */
const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === '') return undefined
    const parsed = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(parsed) ? parsed : undefined
  })

const measurementFields = {
  height: optionalNumber,
  weight: optionalNumber,
  temperature: optionalNumber,
  pulseRate: optionalNumber,
  bloodPressure: z.string().optional(),
  vaccineName: z.string().optional(),
  hospitalName: z.string().optional(),
}

// POST /health/records - 서버 HealthCreateHealthRecordRequest 대응
export const createHealthRecordBodySchema = z.object({
  childId: z.string().min(1, '아이를 선택해주세요'),
  recordType: z.enum(RecordType),
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  recordDate: z.string().min(1, '기록 날짜를 선택해주세요'), // ISO LocalDateTime
  nextDate: z.string().optional(),
  location: z.string().optional(),
  doctorName: z.string().optional(),
  ...measurementFields,
})
export type CreateHealthRecordBody = z.input<typeof createHealthRecordBodySchema>

// PUT /health/records/{recordId} - 서버 HealthUpdateHealthRecordRequest 대응
export const updateHealthRecordBodySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  recordDate: z.string().min(1, '기록 날짜를 선택해주세요'),
  nextDate: z.string().optional(),
  location: z.string().optional(),
  doctorName: z.string().optional(),
  isCompleted: z.boolean().optional(),
  ...measurementFields,
})
export type UpdateHealthRecordBody = z.input<typeof updateHealthRecordBodySchema>

// ==================== 첨부파일 ====================

// 서버 HealthRecordAttachmentResponse / AttachmentResponse 대응
export const attachmentSchema = z.object({
  attachmentId: z.number().nullish(),
  id: z.number().nullish(),
  recordId: z.number().nullish(),
  fileUrl: z.string().nullish(),
  fileName: z.string().nullish(),
  fileType: z.string().nullish(),
  fileSize: z.number().nullish(),
  description: z.string().nullish(),
  displayOrder: z.number().nullish(),
  createdAt: z.string().nullish(),
})
export type Attachment = z.infer<typeof attachmentSchema>
export const attachmentListSchema = z.array(attachmentSchema)

/** 업로드 API 와 등록 API 의 식별자 필드명이 달라 한쪽으로 맞춰 읽는다. */
export const getAttachmentId = (attachment: Attachment): number =>
  attachment.attachmentId ?? attachment.id ?? 0

// ==================== 알림 / 통계 ====================

// 서버 HealthAlertResponse 대응
/**
 * GET /health/recommendations — 아이 월령 기준 넛지.
 *
 * 추천 정책·시설은 **이름 문자열만** 온다(id 가 없다). 상세로 바로 보낼 수 없으므로
 * 화면에서는 검색 지름길로 쓴다.
 */
export const healthRecommendationSchema = z.object({
  nudgeMessage: z.string().nullish(),
  childAge: z.number().nullish(),
  recommendedPolicies: z.array(z.string()).nullish(),
  recommendedFacilities: z.array(z.string()).nullish(),
})
export type HealthRecommendation = z.infer<typeof healthRecommendationSchema>

export const healthAlertSchema = z.object({
  alertId: z.string().nullish(),
  alertType: z.string().nullish(),
  title: z.string().nullish(),
  message: z.string().nullish(),
  priority: z.string().nullish(), // HIGH, MEDIUM, LOW
  dueDate: z.string().nullish(),
  isRead: z.boolean().nullish(),
})
export type HealthAlert = z.infer<typeof healthAlertSchema>
export const healthAlertListSchema = z.array(healthAlertSchema)

export const healthStatsSchema = z.record(z.unknown())
export type HealthStats = z.infer<typeof healthStatsSchema>
