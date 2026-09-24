import { z } from 'zod'

// 서버 ChildInfoResponse 대응
export const childSchema = z.object({
  id: z.number(),
  userId: z.number().nullish(),
  name: z.string(),
  birthDate: z.string().nullish(), // yyyy-MM-dd
  gender: z.string().nullish(),
  // 수정 화면이 현재 값을 읽어와야 한다. 수정은 전체 교체라 못 읽으면 저장할 때마다 지워진다.
  specialNeeds: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type Child = z.infer<typeof childSchema>
export const childListSchema = z.array(childSchema)

// POST/PUT /children - 서버 ChildCreateRequest 대응
export const childBodySchema = z.object({
  name: z.string().min(1, '아이 이름을 입력해주세요').max(100, '이름은 100자를 넘을 수 없습니다'),
  birthDate: z.string().min(1, '생년월일을 선택해주세요'), // yyyy-MM-dd
  gender: z.string().max(10).optional(),
  specialNeeds: z.string().max(500).optional(),
})
export type ChildBody = z.infer<typeof childBodySchema>

// ==================== 예방접종 ====================

export const VaccinationStatus = ['SCHEDULED', 'COMPLETED', 'SKIPPED'] as const
export type VaccinationStatus = (typeof VaccinationStatus)[number]

// 서버 VaccinationScheduleResponse 대응
export const vaccinationScheduleSchema = z.object({
  id: z.number(),
  childId: z.number().nullish(),
  vaccineType: z.string(),
  vaccineName: z.string().nullish(),
  doseNumber: z.number().nullish(),
  totalDoses: z.number().nullish(),
  dueDate: z.string().nullish(), // yyyy-MM-dd
  completedDate: z.string().nullish(),
  status: z.string(),
  overdue: z.boolean().default(false),
})
export type VaccinationSchedule = z.infer<typeof vaccinationScheduleSchema>
export const vaccinationScheduleListSchema = z.array(vaccinationScheduleSchema)

// ==================== 성장 곡선 ====================

export const GrowthMetric = ['WEIGHT', 'HEIGHT'] as const
export type GrowthMetric = (typeof GrowthMetric)[number]

export const GROWTH_METRIC_LABEL: Record<GrowthMetric, string> = {
  WEIGHT: '몸무게',
  HEIGHT: '키',
}

/**
 * 서버 GrowthPointResponse 대응.
 * percentile 계열은 성별/생년월일이 없거나 WHO 표준 범위(0~60개월) 밖이면 null 이다.
 */
export const growthPointSchema = z.object({
  recordDate: z.string(),
  ageMonths: z.number(),
  value: z.number(),
  metric: z.string(),
  unit: z.string().nullish(),
  percentile: z.number().nullish(),
  zScore: z.number().nullish(),
  medianValue: z.number().nullish(),
  interpretation: z.string().nullish(),
  needsAttention: z.boolean().nullish(),
})
export type GrowthPoint = z.infer<typeof growthPointSchema>
export const growthPointListSchema = z.array(growthPointSchema)

// ==================== 자녀 통합 현황 ====================

// 서버 SiblingOverviewResponse.ChildSummary 대응
export const childSummarySchema = z.object({
  childId: z.number(),
  name: z.string(),
  birthDate: z.string().nullish(),
  ageMonths: z.number().nullish(),
  /** 어린이집·유치원 반 편성 기준 */
  classLabel: z.string().nullish(),
  /** 다가오는 접종. 아이별로 흩어져 있으면 놓치기 쉽다 */
  nextVaccination: z.string().nullish(),
  nextVaccinationDate: z.string().nullish(),
  waitlistCount: z.number().default(0),
})
export type ChildSummary = z.infer<typeof childSummarySchema>

/**
 * 서버 SiblingOverviewResponse 대응.
 * 다자녀 가구가 아이별로 화면을 다시 여는 불편을 없애기 위한 통합 뷰.
 */
export const siblingOverviewSchema = z.object({
  childCount: z.number().default(0),
  /** 다자녀 기준 충족 여부. 어린이집 입소 가점과 다자녀 정책의 조건이다 */
  multiChildHousehold: z.boolean().default(false),
  children: z
    .array(childSummarySchema)
    .nullish()
    .transform((v) => v ?? []),
  /** 자녀 수 덕분에 받을 수 있게 된 정책 */
  multiChildBenefits: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  notes: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
})
export type SiblingOverview = z.infer<typeof siblingOverviewSchema>
