import { CareCode } from './interceptor'
import {
  Booking,
  bookingListSchema,
  bookingSchema,
  Facility,
  facilityListSchema,
  FacilityReview,
  FacilityAdvancedSearchBody,
  facilityAdvancedSearchBodySchema,
  FacilityReviewBody,
  facilityReviewBodySchema,
  facilityReviewListSchema,
  facilityReviewSchema,
  GetFacilitiesByLocationPath,
  getFacilitiesByLocationPathSchema,
  GetFacilitiesByTypePath,
  getFacilitiesByTypePathSchema,
  GetFacilitiesInRadiusQuery,
  getFacilitiesInRadiusQuerySchema,
  GetFacilitiesQuery,
  getFacilitiesQuerySchema,
  GetFacilityByIdPath,
  getFacilityByIdPathSchema,
  getFacilityByIdResponseSchema,
  GetFacilityStatisticsResponse,
  getFacilityStatisticsResponseSchema,
  PostFacilitiesSearchBody,
  postFacilitiesSearchBodySchema,
  PostFacilitiesSearchResponse,
  postFacilitiesSearchResponseSchema,
  PostFacilityBookBody,
  postFacilityBookBodySchema,
  PostFacilityBookPath,
  postFacilityBookPathSchema,
} from '@/types/apis/facility'

// 시설 목록 조회
export const getFacilities = async (query: GetFacilitiesQuery = {}): Promise<Facility[]> => {
  const parsedQuery = getFacilitiesQuerySchema.parse(query)
  const res = await CareCode.get('/facilities', { params: parsedQuery })
  return facilityListSchema.parse(res.data)
}

// 시설 상세 정보 조회
export const getFacilityById = async (path: GetFacilityByIdPath): Promise<Facility> => {
  const parsedPath = getFacilityByIdPathSchema.parse(path)
  const res = await CareCode.get(`/facilities/${parsedPath.id}`)
  return getFacilityByIdResponseSchema.parse(res.data)
}

// 시설 유형별 조회
export const getFacilitiesByType = async (path: GetFacilitiesByTypePath): Promise<Facility[]> => {
  const parsedPath = getFacilitiesByTypePathSchema.parse(path)
  const res = await CareCode.get(`/facilities/type/${parsedPath.facilityType}`)
  return facilityListSchema.parse(res.data)
}

// 지역 기반 시설 조회
export const getFacilitiesByLocation = async (
  path: GetFacilitiesByLocationPath,
): Promise<Facility[]> => {
  const parsedPath = getFacilitiesByLocationPathSchema.parse(path)
  const res = await CareCode.get(`/facilities/location/${encodeURIComponent(parsedPath.location)}`)
  return facilityListSchema.parse(res.data)
}

// 반경 내 시설 조회
export const getFacilitiesInRadius = async (
  query: GetFacilitiesInRadiusQuery,
): Promise<Facility[]> => {
  const parsedQuery = getFacilitiesInRadiusQuerySchema.parse(query)
  const res = await CareCode.get('/facilities/radius', { params: parsedQuery })
  return facilityListSchema.parse(res.data)
}

// 인기 시설
export const getPopularFacilities = async (limit = 10): Promise<Facility[]> => {
  const res = await CareCode.get('/facilities/popular', { params: { limit } })
  return facilityListSchema.parse(res.data)
}

// 신규 등록 시설
export const getNewFacilities = async (limit = 10): Promise<Facility[]> => {
  const res = await CareCode.get('/facilities/new', { params: { limit } })
  return facilityListSchema.parse(res.data)
}

// 시설 검색 (페이징)
export const postSearchFacilities = async (
  body: PostFacilitiesSearchBody,
): Promise<PostFacilitiesSearchResponse> => {
  const parsedBody = postFacilitiesSearchBodySchema.parse(body)
  const res = await CareCode.post('/facilities/search', parsedBody)
  return postFacilitiesSearchResponseSchema.parse(res.data)
}

// 고급 검색 - 조건으로 거른다. 응답은 페이지가 아니라 배열이다.
export const postAdvancedSearchFacilities = async (
  body: FacilityAdvancedSearchBody,
): Promise<Facility[]> => {
  const parsedBody = facilityAdvancedSearchBodySchema.parse(body)
  const res = await CareCode.post('/facilities/advanced-search', parsedBody)
  return facilityListSchema.parse(res.data)
}

// 시설 통계
export const getFacilityStatistics = async (): Promise<GetFacilityStatisticsResponse> => {
  const res = await CareCode.get('/facilities/statistics')
  return getFacilityStatisticsResponseSchema.parse(res.data)
}

// 조회수 증가 (상세 진입 시 호출, 실패해도 화면에 영향을 주지 않는다)
export const postFacilityView = async (id: number): Promise<void> => {
  await CareCode.post(`/facilities/${id}/view`)
}

// ==================== 리뷰 ====================

export const getFacilityReviews = async (facilityId: number): Promise<FacilityReview[]> => {
  const res = await CareCode.get(`/facilities/${facilityId}/reviews`)
  return facilityReviewListSchema.parse(res.data)
}

export const postFacilityReview = async (
  facilityId: number,
  body: FacilityReviewBody,
): Promise<FacilityReview> => {
  const parsedBody = facilityReviewBodySchema.parse(body)
  const res = await CareCode.post(`/facilities/${facilityId}/reviews`, parsedBody)
  return facilityReviewSchema.parse(res.data)
}

export const putFacilityReview = async (
  reviewId: number,
  body: FacilityReviewBody,
): Promise<FacilityReview> => {
  const parsedBody = facilityReviewBodySchema.parse(body)
  const res = await CareCode.put(`/facilities/reviews/${reviewId}`, parsedBody)
  return facilityReviewSchema.parse(res.data)
}

export const deleteFacilityReview = async (reviewId: number): Promise<void> => {
  await CareCode.delete(`/facilities/reviews/${reviewId}`)
}

// ==================== 예약 ====================

// 시설 예약 생성
export const postBookFacility = async (
  path: PostFacilityBookPath,
  body: PostFacilityBookBody,
): Promise<Booking> => {
  const parsedPath = postFacilityBookPathSchema.parse(path)
  const parsedBody = postFacilityBookBodySchema.parse(body)
  const res = await CareCode.post(`/facilities/${parsedPath.facilityId}/bookings`, parsedBody)
  return bookingSchema.parse(res.data)
}

// 내 예약 목록
export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await CareCode.get('/facilities/bookings/user')
  return bookingListSchema.parse(res.data)
}

// 예약 상세
export const getBookingById = async (bookingId: number): Promise<Booking> => {
  const res = await CareCode.get(`/facilities/bookings/${bookingId}`)
  return bookingSchema.parse(res.data)
}

// 예약 취소
export const cancelBooking = async (bookingId: number): Promise<void> => {
  await CareCode.delete(`/facilities/bookings/${bookingId}`)
}
