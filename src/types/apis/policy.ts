import { z } from 'zod'

// export const policySchema = z.object({
//   id: z.number(),
//   title: z.string(),
//   description: z.string(),
//   category: z.string(),
//   targetAge: z.string(),
//   region: z.string(),
//   eligibility: z.string(),
//   supportAmount: z.string(),
//   applicationPeriod: z.string().optional(),
//   applicationMethod: z.string().optional(),
//   requiredDocuments: z.array(z.string()).optional(),
//   contactInfo: z.string().optional(),
//   documentUrl: z.string().url().optional(),
//   isActive: z.boolean(),
//   viewCount: z.number(),
//   createdAt: z.string(),
//   updatedAt: z.string(),
// })
// export type Policy = z.infer<typeof policySchema>

/**
 * 서버 PolicyDto 대응 스키마.
 * 공공데이터로 수집된 정책은 설명·연락처·신청기간 등이 비어 있는 경우가 많아
 * 식별자와 제목 외에는 모두 nullish 로 둔다.
 */
export const policySchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullish(),
  category: z.string().nullish(),
  location: z.string().nullish(),
  name: z.string().nullish(),
  displayOrder: z.number().nullish(),
  minAge: z.number().nullish(),
  maxAge: z.number().nullish(),
  supportAmount: z.number().nullish(),
  applicationPeriod: z.string().nullish(),
  eligibilityCriteria: z.string().nullish(),
  applicationMethod: z.string().nullish(),
  requiredDocuments: z.string().nullish(),
  contactInfo: z.string().nullish(),
  websiteUrl: z.string().nullish(),
  viewCount: z.number().nullish(),
  isActive: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type Policy = z.infer<typeof policySchema>

export const policyListItemSchema = policySchema.pick({
  id: true,
  title: true,
  description: true,
  category: true,
  location: true,
  minAge: true,
  maxAge: true,
  supportAmount: true,
  applicationPeriod: true,
  eligibilityCriteria: true,
  applicationMethod: true,
  contactInfo: true,
  websiteUrl: true,
  isActive: true,
  createdAt: true,
})
export type PolicyListItem = z.infer<typeof policyListItemSchema>

// /policies
// /policies/{policyId}
export const getPolicyByIdPathSchema = z.object({
  policyId: z.number(),
})
export type GetPolicyByIdPath = z.infer<typeof getPolicyByIdPathSchema>
export const getPolicyByIdResponseSchema = policySchema
export type GetPolicyByIdResponse = z.infer<typeof getPolicyByIdResponseSchema>

// /policies/latest
/** GET /policies/categories — 카테고리 이름 목록 */
export const policyCategoryListSchema = z.array(z.string())
export type PolicyCategoryList = z.infer<typeof policyCategoryListSchema>

export const getLatestPoliciesResponseSchema = z.array(policySchema)
export type GetLatestPoliciesResponse = z.infer<typeof getLatestPoliciesResponseSchema>

// /policies/search
export const policySearchRequestSchema = z.object({
  keyword: z.string().max(100).optional(),
  category: z.enum(['EDUCATION', 'HEALTH', 'FINANCIAL', 'SUPPORT', 'OTHER']).optional(),
  location: z.string().max(100).optional(),
  minAge: z.number().min(0).max(18).optional(),
  maxAge: z.number().min(0).max(18).optional(),
  page: z.number().min(0).optional(),
  size: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['title', 'category', 'location', 'createdAt']).optional(),
  sortDirection: z.enum(['ASC', 'DESC']).optional(),
})
export type PolicySearchRequestDto = z.infer<typeof policySearchRequestSchema>

export const policySearchResponseSchema = z.object({
  policies: z.array(policySchema),
  totalElements: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
})
export type PolicySearchResponseDto = z.infer<typeof policySearchResponseSchema>

// ==================== 맞춤 추천 ====================

// 서버 PersonalizedPolicyResponse 대응
export const personalizedPolicySchema = z.object({
  policy: policySchema,
  score: z.number().nullish(),
  /** 왜 추천됐는지. 근거 없는 추천은 신뢰를 얻지 못하므로 화면에 함께 노출한다. */
  reasons: z.array(z.string()).nullish(),
})
export type PersonalizedPolicy = z.infer<typeof personalizedPolicySchema>
export const personalizedPolicyListSchema = z.array(personalizedPolicySchema)

// ==================== 놓친 지원금 ====================

// 서버 MissedBenefitResponse 대응
export const missedBenefitSchema = z.object({
  policyId: z.number(),
  title: z.string(),
  childName: z.string().nullish(),
  eligibleFromMonth: z.number().nullish(),
  eligibleToMonth: z.number().nullish(),
  /** 지금도 소급 신청이 가능한지 */
  claimable: z.boolean().default(false),
  /** 소급 마감까지 남은 개월. claimable=false 면 null */
  remainingMonths: z.number().nullish(),
  benefitAmount: z.number().nullish(),
  applicationUrl: z.string().nullish(),
  reasons: z.array(z.string()).nullish(),
})
export type MissedBenefit = z.infer<typeof missedBenefitSchema>

// 서버 MissedBenefitSummaryResponse 대응
export const missedBenefitSummarySchema = z.object({
  claimableCount: z.number().default(0),
  /** 소급 가능한 건의 합계(원). 금액 미상 정책은 빠져 있다 */
  claimableAmount: z.number().default(0),
  expiredCount: z.number().default(0),
  /** 소득 정보가 없어 판정을 보류한 건수 */
  unknownEligibilityCount: z.number().default(0),
  claimable: z
    .array(missedBenefitSchema)
    .nullish()
    .transform((v) => v ?? []),
  expired: z
    .array(missedBenefitSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type MissedBenefitSummary = z.infer<typeof missedBenefitSummarySchema>

// ==================== 거주지별 지원금 비교 ====================

export const DataQuality = ['VERIFIED', 'PARTIAL', 'ESTIMATED'] as const
export type DataQuality = (typeof DataQuality)[number]

/** 금액 신뢰도. 미검증 추정치를 확정 금액처럼 보여주면 안 되므로 문구를 구분한다. */
export const DATA_QUALITY_LABEL: Record<string, string> = {
  VERIFIED: '검증된 금액',
  PARTIAL: '일부만 검증됨',
  ESTIMATED: '추정 금액',
}

export const benefitContributionSchema = z.object({
  title: z.string(),
  amount: z.number().default(0),
  paymentType: z.string().nullish(),
})
export type BenefitContribution = z.infer<typeof benefitContributionSchema>

// 서버 RegionalBenefitResponse 대응
export const regionalBenefitSchema = z.object({
  region: z.string(),
  /** 기간 내 예상 총액(원) */
  totalAmount: z.number().default(0),
  /** 현재 거주지 대비 차액(원). 음수면 지금이 더 유리하다 */
  differenceFromBase: z.number().default(0),
  cashPolicyCount: z.number().default(0),
  /** 금액이 아닌 혜택(무료검진 등). 합산에서 빠져 있다 */
  nonCashPolicyCount: z.number().default(0),
  verifiedPolicyCount: z.number().default(0),
  dataQuality: z.string().nullish(),
  topContributors: z
    .array(benefitContributionSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type RegionalBenefit = z.infer<typeof regionalBenefitSchema>

// 서버 RegionalBenefitComparisonResponse 대응
export const regionalComparisonSchema = z.object({
  childName: z.string().nullish(),
  childAgeMonths: z.number().nullish(),
  horizonMonths: z.number().default(0),
  /** 기준 거주지. 주소 미입력이면 null */
  baseRegion: z.string().nullish(),
  baseAmount: z.number().nullish(),
  rankings: z
    .array(regionalBenefitSchema)
    .nullish()
    .transform((v) => v ?? []),
  dataQuality: z.string().nullish(),
  disclaimers: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
})
export type RegionalComparison = z.infer<typeof regionalComparisonSchema>

export const regionalComparisonQuerySchema = z.object({
  childId: z.number().optional(),
  /** 전망 기간(년) */
  years: z.number().min(1).max(20).optional(),
  limit: z.number().min(1).max(50).optional(),
})
export type RegionalComparisonQuery = z.infer<typeof regionalComparisonQuerySchema>

// ==================== 실수령액 제보 ====================

export const PaymentType = ['MONTHLY', 'ONE_TIME'] as const
export type PaymentType = (typeof PaymentType)[number]

export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  MONTHLY: '매월',
  ONE_TIME: '일시금',
}

/** 육아 지원금에 1억을 넘는 항목은 없다. 자릿수 오입력을 막는 서버 상한과 맞춘다. */
const MAX_BENEFIT_AMOUNT = 100_000_000

// POST /policies/{policyId}/amount-reports - 서버 BenefitAmountReportRequest 대응
export const benefitAmountReportBodySchema = z.object({
  amount: z
    .number()
    .min(0, '수령액은 0 이상이어야 합니다')
    .max(MAX_BENEFIT_AMOUNT, '수령액이 너무 커요. 자릿수를 확인해주세요'),
  paymentType: z.enum(PaymentType),
  receivedAt: z.string().optional(), // yyyy-MM-dd
  note: z.string().max(300, '메모는 300자 이하여야 합니다').optional(),
})
export type BenefitAmountReportBody = z.infer<typeof benefitAmountReportBodySchema>

/**
 * 서버 BenefitAmountConsensusResponse 대응.
 * `remainingForConsensus` 는 서버가 계산해 내려주는 값이다 (getter).
 */
export const benefitAmountConsensusSchema = z.object({
  policyId: z.number().nullish(),
  title: z.string().nullish(),
  totalReports: z.number().default(0),
  /** 확정에 필요한 동일 응답 수 */
  consensusThreshold: z.number().default(0),
  agreedCount: z.number().default(0),
  consensusAmount: z.number().nullish(),
  consensusPaymentType: z.string().nullish(),
  /** true 면 정책 금액이 이 값으로 채워졌다 */
  confirmed: z.boolean().default(false),
  currentAmount: z.number().nullish(),
  remainingForConsensus: z.number().default(0),
})
export type BenefitAmountConsensus = z.infer<typeof benefitAmountConsensusSchema>

// ==================== 북마크 ====================

// 서버 PolicyBookmarkResponse 대응
export const policyBookmarkSchema = z.object({
  policyId: z.string(),
  userId: z.string().nullish(),
  title: z.string().nullish(),
  category: z.string().nullish(),
  bookmarkedAt: z.string().nullish(),
})
export type PolicyBookmark = z.infer<typeof policyBookmarkSchema>
export const policyBookmarkListSchema = z.array(policyBookmarkSchema)
