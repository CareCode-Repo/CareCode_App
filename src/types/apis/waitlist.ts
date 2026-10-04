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

// ==================== 예측 정확도 ====================

/**
 * 서버 ForecastAccuracyResponse.Bucket 대응.
 * "60~80% 라고 말한 건들이 실제로는 몇 번 맞았나" 한 줄.
 */
export const forecastBucketSchema = z.object({
  from: z.number(),
  to: z.number(),
  samples: z.number().default(0),
  actualTrue: z.number().default(0),
  /** 표본 0이면 null */
  actualRate: z.number().nullish(),
})
export type ForecastBucket = z.infer<typeof forecastBucketSchema>

/**
 * 서버 ForecastAccuracyResponse 대응.
 *
 * 확률만 보여주면 사용자는 그 숫자를 믿을지 판단할 근거가 없다. 과거 관측으로 같은 계산을 다시
 * 돌려 실제와 비교한 값이라, 틀린 것까지 드러난다. 그 점이 이 데이터의 쓸모다.
 */
export const forecastAccuracySchema = z.object({
  measuredAt: z.string().nullish(),
  horizonMonths: z.number().default(0),
  /** 검증에 쓴 예측 건수 */
  samples: z.number().default(0),
  facilities: z.number().default(0),
  /** 표본에서 실제로 자리가 난 비율 (0~1) */
  actualRate: z.number().default(0),
  /** 낮을수록 정확. 0=완벽, 0.25=동전 던지기 */
  brierScore: z.number().default(0),
  baselineBrierScore: z.number().default(0),
  /** false 면 화면에서 확률을 강조하지 않는 편이 맞다 */
  betterThanBaseline: z.boolean().default(false),
  /** 지금 보여주는 확률이 속한 구간의 실제 적중률. 표본이 적으면 null */
  matchedBucket: forecastBucketSchema.nullish(),
  calibration: z
    .array(forecastBucketSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type ForecastAccuracy = z.infer<typeof forecastAccuracySchema>

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
  /**
   * 이 확률이 과거에 얼마나 맞았는지.
   * 서버는 처음부터 보내고 있었는데 이 스키마에 없어 zod 가 조용히 버리고 있었다.
   */
  accuracy: forecastAccuracySchema.nullish(),
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

// ==================== 아이 기준 입소 후보 ====================

// 서버 AdmissionCandidateResponse.Candidate 대응
export const admissionCandidateSchema = z.object({
  facilityId: z.number(),
  facilityName: z.string(),
  address: z.string().nullish(),
  probability: z.number().nullish(),
  confidence: z.string().nullish(),
  observationCount: z.number().default(0),
  observationDays: z.number().default(0),
  /** 공공데이터에 적힌 현재 잔여석. 예측과 달리 지금 시점의 값이다 */
  availableSpots: z.number().nullish(),
  reasons: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
})
export type AdmissionCandidate = z.infer<typeof admissionCandidateSchema>

/**
 * 서버 AdmissionCandidateResponse 대응.
 * 시설을 먼저 고르지 않아도 "어디에 들어갈 수 있나" 에 답한다.
 */
export const admissionCandidateListSchema = z.object({
  region: z.string(),
  childAgeMonths: z.number().default(0),
  targetClass: z.string().nullish(),
  horizonMonths: z.number().default(6),
  targetDate: z.string().nullish(),
  /** 지역에서 후보로 본 시설 수 */
  evaluatedFacilities: z.number().default(0),
  /** 관측이 모자라 확률을 내지 못한 시설 수. 숨기면 "이 동네에 몇 곳뿐인가" 로 읽힌다 */
  notEnoughDataCount: z.number().default(0),
  accuracy: forecastAccuracySchema.nullish(),
  candidates: z
    .array(admissionCandidateSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type AdmissionCandidateList = z.infer<typeof admissionCandidateListSchema>

export const admissionCandidateQuerySchema = z.object({
  region: z.string().min(1),
  childAgeMonths: z.number().min(0),
  horizonMonths: z.number().min(1).max(36).optional(),
  limit: z.number().min(1).max(50).optional(),
})
export type AdmissionCandidateQuery = z.infer<typeof admissionCandidateQuerySchema>
