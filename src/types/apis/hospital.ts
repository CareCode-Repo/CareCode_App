import { z } from 'zod'

/**
 * 요양기관 종별. 동네 의원과 대학병원은 찾는 상황이 달라 필터로 구분한다.
 * 좁은 순서대로 둔다 (급할 때 가까운 의원 / 큰 병 의심될 때 상급종합).
 */
export const HOSPITAL_GRADES = ['의원', '병원', '종합병원', '상급종합'] as const
export type HospitalGrade = (typeof HOSPITAL_GRADES)[number]

// 서버 HospitalInfoResponse 대응
export const hospitalSchema = z.object({
  id: z.number(),
  name: z.string(),
  /** 진료과목 (소아청소년과 등) */
  type: z.string().nullish(),
  /** 요양기관 종별 (의원/병원/종합병원/상급종합) */
  grade: z.string().nullish(),
  address: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type Hospital = z.infer<typeof hospitalSchema>
export const hospitalListSchema = z.array(hospitalSchema)

// 서버 HospitalReviewResponse 대응
export const hospitalReviewSchema = z.object({
  id: z.number(),
  userId: z.number().nullish(),
  hospitalId: z.number().nullish(),
  hospitalName: z.string().nullish(),
  userName: z.string().nullish(),
  rating: z.number().nullish(),
  content: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type HospitalReview = z.infer<typeof hospitalReviewSchema>
export const hospitalReviewListSchema = z.array(hospitalReviewSchema)

// GET /health/hospitals/{id}/like-status - 서버 HospitalLikeStatusResponse 대응
export const hospitalLikeStatusSchema = z.object({
  hospitalId: z.number().nullish(),
  liked: z.boolean(),
  likeCount: z.number(),
})
export type HospitalLikeStatus = z.infer<typeof hospitalLikeStatusSchema>

// POST /health/hospitals/{id}/reviews - 서버 HealthCreateHospitalReviewRequest 대응
export const createHospitalReviewBodySchema = z.object({
  hospitalId: z.number(),
  rating: z.number().min(1, '별점을 선택해주세요').max(5),
  content: z.string().min(1, '리뷰 내용을 입력해주세요'),
})
export type CreateHospitalReviewBody = z.infer<typeof createHospitalReviewBodySchema>

// PUT /health/hospitals/reviews/{reviewId}
export const updateHospitalReviewBodySchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(1),
})
export type UpdateHospitalReviewBody = z.infer<typeof updateHospitalReviewBodySchema>

// GET /health/hospitals/nearby
export const nearbyHospitalsQuerySchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius: z.number().positive(),
})
export type NearbyHospitalsQuery = z.infer<typeof nearbyHospitalsQuerySchema>
