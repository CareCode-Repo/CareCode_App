import { CareCode } from '@/apis/interceptor'
import {
  GetPolicyByIdPath,
  getPolicyByIdPathSchema,
  getPolicyByIdResponseSchema,
  GetPolicyByIdResponse,
  getLatestPoliciesResponseSchema,
  GetLatestPoliciesResponse,
  PolicyCategoryList,
  policyCategoryListSchema,
  PolicySearchRequestDto,
  policySearchRequestSchema,
  PolicySearchResponseDto,
  policySearchResponseSchema,
  PersonalizedPolicy,
  personalizedPolicyListSchema,
  MissedBenefitSummary,
  missedBenefitSummarySchema,
  RegionalComparison,
  regionalComparisonSchema,
  RegionalComparisonQuery,
  regionalComparisonQuerySchema,
  PolicyBookmark,
  policyBookmarkSchema,
  policyBookmarkListSchema,
  BenefitAmountConsensus,
  benefitAmountConsensusSchema,
  BenefitAmountReportBody,
  benefitAmountReportBodySchema,
} from '@/types/apis/policy'

export const getPolicyById = async (path: GetPolicyByIdPath): Promise<GetPolicyByIdResponse> => {
  const parsedPath = getPolicyByIdPathSchema.parse(path)
  const res = await CareCode.get(`/policies/${parsedPath.policyId}`)
  return getPolicyByIdResponseSchema.parse(res.data)
}

export const getLatestPolicies = async (): Promise<GetLatestPoliciesResponse> => {
  const res = await CareCode.get('/policies/latest')
  return getLatestPoliciesResponseSchema.parse(res.data)
}

// GET /policies/categories - 카테고리 이름 목록
export const getPolicyCategories = async (): Promise<PolicyCategoryList> => {
  const res = await CareCode.get('/policies/categories')
  return policyCategoryListSchema.parse(res.data)
}

// GET /policies/category/{category} - 그 카테고리의 정책 목록
export const getPoliciesByCategory = async (
  category: string,
): Promise<GetLatestPoliciesResponse> => {
  const res = await CareCode.get(`/policies/category/${encodeURIComponent(category)}`)
  return getLatestPoliciesResponseSchema.parse(res.data)
}

// GET /policies/popular - 조회수 기준 인기 정책
export const getPopularPolicies = async (): Promise<GetLatestPoliciesResponse> => {
  const res = await CareCode.get('/policies/popular')
  return getLatestPoliciesResponseSchema.parse(res.data)
}

export const searchPolicies = async (
  request: PolicySearchRequestDto,
): Promise<PolicySearchResponseDto> => {
  const parsedRequest = policySearchRequestSchema.parse(request)
  const res = await CareCode.post('/policies/search', parsedRequest)
  return policySearchResponseSchema.parse(res.data)
}

// GET /policies/recommendations - 자녀 월령·거주지 기반 추천
export const getPolicyRecommendations = async (limit = 10): Promise<PersonalizedPolicy[]> => {
  const res = await CareCode.get('/policies/recommendations', { params: { limit } })
  return personalizedPolicyListSchema.parse(res.data)
}

// GET /policies/missed-benefits - 놓친 지원금과 소급 가능 여부
export const getMissedBenefits = async (): Promise<MissedBenefitSummary> => {
  const res = await CareCode.get('/policies/missed-benefits')
  return missedBenefitSummarySchema.parse(res.data)
}

// GET /policies/regional-comparison - 지역별 예상 수령액 비교
export const getRegionalComparison = async (
  query: RegionalComparisonQuery = {},
): Promise<RegionalComparison> => {
  const parsedQuery = regionalComparisonQuerySchema.parse(query)
  const res = await CareCode.get('/policies/regional-comparison', { params: parsedQuery })
  return regionalComparisonSchema.parse(res.data)
}

/**
 * 지원금 신청 페이지 주소.
 *
 * 서버가 클릭을 집계한 뒤 실제 신청처로 리다이렉트한다. 이 전환이 "돈을 찾아줬는지" 를
 * 보여주는 유일한 지표이므로 applicationUrl 로 직접 가지 말고 항상 이 경로를 거친다.
 */
export const getPolicyApplyUrl = (policyId: number): string =>
  `${process.env.NEXT_PUBLIC_API_URL ?? ''}/policies/${policyId}/apply`

// POST /policies/{policyId}/view - 조회수 집계 (실패해도 화면에 영향 없음)
export const postPolicyView = async (policyId: number): Promise<void> => {
  await CareCode.post(`/policies/${policyId}/view`)
}

// ==================== 실수령액 제보 ====================

// GET /policies/{policyId}/amount-reports - 확정까지 몇 명이 더 필요한지
export const getBenefitAmountConsensus = async (
  policyId: number,
): Promise<BenefitAmountConsensus> => {
  const res = await CareCode.get(`/policies/${policyId}/amount-reports`)
  return benefitAmountConsensusSchema.parse(res.data)
}

// POST /policies/{policyId}/amount-reports - 받은 금액을 알려 정보를 함께 채운다
export const postBenefitAmountReport = async (
  policyId: number,
  body: BenefitAmountReportBody,
): Promise<BenefitAmountConsensus> => {
  const parsedBody = benefitAmountReportBodySchema.parse(body)
  const res = await CareCode.post(`/policies/${policyId}/amount-reports`, parsedBody)
  return benefitAmountConsensusSchema.parse(res.data)
}

// ==================== 북마크 ====================

// GET /policies/bookmarks
export const getPolicyBookmarks = async (): Promise<PolicyBookmark[]> => {
  const res = await CareCode.get('/policies/bookmarks')
  return policyBookmarkListSchema.parse(res.data)
}

// POST /policies/{policyId}/bookmarks
export const postPolicyBookmark = async (policyId: number): Promise<PolicyBookmark> => {
  const res = await CareCode.post(`/policies/${policyId}/bookmarks`)
  return policyBookmarkSchema.parse(res.data)
}

// DELETE /policies/{policyId}/bookmarks
export const deletePolicyBookmark = async (policyId: number): Promise<void> => {
  await CareCode.delete(`/policies/${policyId}/bookmarks`)
}
