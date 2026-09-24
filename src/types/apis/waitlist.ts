import { z } from 'zod'

export const WaitlistStatus = ['WAITING', 'ADMITTED', 'GAVE_UP'] as const
export type WaitlistStatus = (typeof WaitlistStatus)[number]

export const WAITLIST_STATUS_LABEL: Record<string, string> = {
  WAITING: '대기 중',
  ADMITTED: '입소',
  GAVE_UP: '포기',
}

// POST /facilities/{facilityId}/waitlist - 서버 WaitlistRequest 대응
export const waitlistRegisterBodySchema = z.object({
  /** 미지정 시 서버가 최근 등록 자녀로 잡는다 */
  childId: z.number().optional(),
  waitNumber: z
    .number()
    .min(1, '대기 순번을 입력해주세요')
    .max(9999, '순번이 너무 큽니다')
    .optional(),
  /** 미지정 시 오늘 (yyyy-MM-dd) */
  appliedAt: z.string().optional(),
  note: z.string().max(300, '메모는 300자 이하여야 합니다').optional(),
})
export type WaitlistRegisterBody = z.infer<typeof waitlistRegisterBodySchema>

/** 서버가 Map 으로 조립해 주는 내 대기 기록 */
export const waitlistEntrySchema = z.object({
  waitlistId: z.number(),
  facilityId: z.number().nullish(),
  waitNumber: z.number().nullish(),
  appliedAt: z.string().nullish(),
  status: z.string(),
  statusName: z.string().nullish(),
  /** 신청 후 지난 일수 */
  waitedDays: z.number().nullish(),
})
export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>
export const waitlistEntryListSchema = z.array(waitlistEntrySchema)

/**
 * 서버 WaitlistStatsResponse 대응.
 * 표본이 모자라면 available=false 이고 수치는 전부 null 이다 — 그때는 숫자를 지어내면 안 된다.
 */
export const waitlistStatsSchema = z.object({
  facilityId: z.number().nullish(),
  facilityName: z.string().nullish(),
  available: z.boolean().default(false),
  unavailableReason: z.string().nullish(),
  /** 입소까지 간 기록 수 = 표본 크기 */
  admittedSamples: z.number().default(0),
  currentlyWaiting: z.number().default(0),
  /** 평균은 이상치에 흔들려 중앙값을 함께 본다 */
  averageWaitDays: z.number().nullish(),
  medianWaitDays: z.number().nullish(),
  maxWaitDays: z.number().nullish(),
  reasons: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
})
export type WaitlistStats = z.infer<typeof waitlistStatsSchema>

// ==================== 입소 예측 ====================

export const ForecastConfidence = ['LOW', 'MEDIUM', 'HIGH'] as const
export type ForecastConfidence = (typeof ForecastConfidence)[number]

export const CONFIDENCE_LABEL: Record<string, string> = {
  LOW: '참고용',
  MEDIUM: '보통',
  HIGH: '높음',
}

// 서버 AdmissionForecastResponse 대응
export const admissionForecastSchema = z.object({
  facilityId: z.number().nullish(),
  facilityName: z.string().nullish(),
  available: z.boolean().default(false),
  unavailableReason: z.string().nullish(),
  /** 관측 기간이 짧을수록 신뢰도가 낮다 */
  observationDays: z.number().default(0),
  observationCount: z.number().default(0),
  targetClass: z.string().nullish(),
  /** 목표 시점까지 자리가 날 확률(0~100) */
  probability: z.number().nullish(),
  confidence: z.string().nullish(),
  targetDate: z.string().nullish(),
  reasons: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
})
export type AdmissionForecast = z.infer<typeof admissionForecastSchema>

export const admissionForecastQuerySchema = z.object({
  childAgeMonths: z.number().min(0).optional(),
  horizonMonths: z.number().min(1).max(36).optional(),
})
export type AdmissionForecastQuery = z.infer<typeof admissionForecastQuerySchema>

// ==================== 인기도 ====================

export const DEMAND_LEVEL_LABEL: Record<string, string> = {
  IN_DEMAND: '수요 많음',
  STEADY: '보통',
  UNDERSUBSCRIBED: '여유 있음',
}

export const TREND_LABEL: Record<string, string> = {
  RISING: '오르는 중',
  STABLE: '유지',
  FALLING: '내리는 중',
}

// 서버 FacilityPopularityResponse 대응
export const facilityPopularitySchema = z.object({
  facilityId: z.number().nullish(),
  facilityName: z.string().nullish(),
  available: z.boolean().default(false),
  unavailableReason: z.string().nullish(),
  observationCount: z.number().default(0),
  /** 충원율(%) = 현원/정원 */
  averageFillRate: z.number().nullish(),
  latestFillRate: z.number().nullish(),
  /** 정원이 꽉 찬 관측 비율(%). 높을수록 대기가 밀린다 */
  fullRatio: z.number().nullish(),
  trend: z.string().nullish(),
  demandLevel: z.string().nullish(),
  /** 충원율 급락 시점. 운영 변화 신호일 수 있다 */
  sharpDropDates: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  reasons: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
})
export type FacilityPopularity = z.infer<typeof facilityPopularitySchema>
