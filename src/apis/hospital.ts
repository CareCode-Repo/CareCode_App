import { CareCode } from './interceptor'
import {
  CreateHospitalReviewBody,
  createHospitalReviewBodySchema,
  Hospital,
  HospitalLikeStatus,
  hospitalLikeStatusSchema,
  hospitalListSchema,
  hospitalReviewListSchema,
  hospitalReviewSchema,
  HospitalReview,
  hospitalSchema,
  NearbyHospitalsQuery,
  nearbyHospitalsQuerySchema,
  UpdateHospitalReviewBody,
  updateHospitalReviewBodySchema,
} from '@/types/apis/hospital'

// GET /health/hospitals
export const getHospitals = async (page?: number, size?: number): Promise<Hospital[]> => {
  const res = await CareCode.get('/health/hospitals', { params: { page, size } })
  return hospitalListSchema.parse(res.data)
}

// GET /health/hospitals/{id}
export const getHospitalById = async (id: number): Promise<Hospital> => {
  const res = await CareCode.get(`/health/hospitals/${id}`)
  return hospitalSchema.parse(res.data)
}

// GET /health/hospitals/nearby
export const getNearbyHospitals = async (query: NearbyHospitalsQuery): Promise<Hospital[]> => {
  const parsedQuery = nearbyHospitalsQuerySchema.parse(query)
  const res = await CareCode.get('/health/hospitals/nearby', { params: parsedQuery })
  return hospitalListSchema.parse(res.data)
}

// GET /health/hospitals/type/{type}
export const getHospitalsByType = async (type: string): Promise<Hospital[]> => {
  const res = await CareCode.get(`/health/hospitals/type/${encodeURIComponent(type)}`)
  return hospitalListSchema.parse(res.data)
}

// GET /health/hospitals/likes - 내가 찜한 병원
export const getLikedHospitals = async (): Promise<Hospital[]> => {
  const res = await CareCode.get('/health/hospitals/likes')
  return hospitalListSchema.parse(res.data)
}

// GET /health/hospitals/popular
export const getPopularHospitals = async (limit = 10): Promise<Hospital[]> => {
  const res = await CareCode.get('/health/hospitals/popular', { params: { limit } })
  return hospitalListSchema.parse(res.data)
}

// ==================== 찜 ====================

// GET /health/hospitals/{id}/like-status - 내 찜 여부 + 총 개수
export const getHospitalLikeStatus = async (id: number): Promise<HospitalLikeStatus> => {
  const res = await CareCode.get(`/health/hospitals/${id}/like-status`)
  return hospitalLikeStatusSchema.parse(res.data)
}

// 대상 사용자는 서버가 인증 주체로 결정하므로 userId 를 보내지 않는다.
// POST /health/hospitals/{id}/like
export const likeHospital = async (id: number): Promise<void> => {
  await CareCode.post(`/health/hospitals/${id}/like`)
}

// DELETE /health/hospitals/{id}/like
export const unlikeHospital = async (id: number): Promise<void> => {
  await CareCode.delete(`/health/hospitals/${id}/like`)
}

// ==================== 리뷰 ====================

// GET /health/hospitals/{id}/reviews
export const getHospitalReviews = async (id: number): Promise<HospitalReview[]> => {
  const res = await CareCode.get(`/health/hospitals/${id}/reviews`)
  return hospitalReviewListSchema.parse(res.data)
}

// POST /health/hospitals/{id}/reviews
export const postHospitalReview = async (
  id: number,
  body: CreateHospitalReviewBody,
): Promise<HospitalReview> => {
  const parsedBody = createHospitalReviewBodySchema.parse(body)
  const res = await CareCode.post(`/health/hospitals/${id}/reviews`, parsedBody)
  return hospitalReviewSchema.parse(res.data)
}

// PUT /health/hospitals/reviews/{reviewId}
export const putHospitalReview = async (
  reviewId: number,
  body: UpdateHospitalReviewBody,
): Promise<HospitalReview> => {
  const parsedBody = updateHospitalReviewBodySchema.parse(body)
  const res = await CareCode.put(`/health/hospitals/reviews/${reviewId}`, parsedBody)
  return hospitalReviewSchema.parse(res.data)
}

// DELETE /health/hospitals/reviews/{reviewId}
export const deleteHospitalReview = async (reviewId: number): Promise<void> => {
  await CareCode.delete(`/health/hospitals/reviews/${reviewId}`)
}
