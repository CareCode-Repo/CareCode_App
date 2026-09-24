import { z } from 'zod'

export const FacilityType = ['KINDERGARTEN', 'DAYCARE', 'PLAYGROUP', 'NURSERY', 'OTHER'] as const
export type FacilityType = (typeof FacilityType)[number]

export const FACILITY_TYPE_LABEL: Record<FacilityType, string> = {
  KINDERGARTEN: '유치원',
  DAYCARE: '어린이집',
  PLAYGROUP: '놀이방',
  NURSERY: '보육원',
  OTHER: '기타',
}

/**
 * 서버 CareFacilityInfo 대응 스키마.
 * 공공데이터 동기화 결과라 좌표·연락처·평점 등 상당수 항목이 비어 있을 수 있어 nullish 로 둔다.
 * facilityType 도 서버가 새 유형을 추가할 수 있으므로 enum 대신 string 으로 받고 표시할 때 매핑한다.
 */
export const facilitySchema = z.object({
  id: z.number(),
  name: z.string(),
  facilityType: z.string().nullish(),
  address: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  email: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  description: z.string().nullish(),
  operatingHours: z.string().nullish(),
  website: z.string().nullish(),
  rating: z.number().nullish(),
  reviewCount: z.number().nullish(),
  likeCount: z.number().nullish(),
  isLiked: z.boolean().nullish(),
  imageUrl: z.string().nullish(),
  amenities: z.array(z.string()).nullish(),
  additionalInfo: z.record(z.unknown()).nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type Facility = z.infer<typeof facilitySchema>

export const facilityListSchema = z.array(facilitySchema)

// GET /facilities
export const getFacilitiesQuerySchema = z.object({
  page: z.number().min(0).optional(),
  size: z.number().min(1).max(100).optional(),
})
export type GetFacilitiesQuery = z.infer<typeof getFacilitiesQuerySchema>
export type GetFacilitiesResponse = Facility[]

// GET /facilities/{id}
export const getFacilityByIdPathSchema = z.object({
  id: z.number(),
})
export type GetFacilityByIdPath = z.infer<typeof getFacilityByIdPathSchema>
export const getFacilityByIdResponseSchema = facilitySchema
export type GetFacilityByIdResponse = z.infer<typeof getFacilityByIdResponseSchema>

// GET /facilities/type/{facilityType}
export const getFacilitiesByTypePathSchema = z.object({
  facilityType: z.enum(FacilityType),
})
export type GetFacilitiesByTypePath = z.infer<typeof getFacilitiesByTypePathSchema>
export const getFacilitiesByTypeResponseSchema = facilityListSchema
export type GetFacilitiesByTypeResponse = z.infer<typeof getFacilitiesByTypeResponseSchema>

// GET /facilities/location/{location}
export const getFacilitiesByLocationPathSchema = z.object({
  location: z.string().min(1),
})
export type GetFacilitiesByLocationPath = z.infer<typeof getFacilitiesByLocationPathSchema>
export const getFacilitiesByLocationResponseSchema = facilityListSchema
export type GetFacilitiesByLocationResponse = z.infer<typeof getFacilitiesByLocationResponseSchema>

// GET /facilities/radius
export const getFacilitiesInRadiusQuerySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().positive(),
})
export type GetFacilitiesInRadiusQuery = z.infer<typeof getFacilitiesInRadiusQuerySchema>

// POST /facilities/search - 서버 CareFacilitySearchRequest 대응
export const postFacilitiesSearchBodySchema = z.object({
  keyword: z.string().optional(),
  facilityType: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  sortBy: z.string().optional(), // rating, reviewCount, createdAt ...
  sortDirection: z.enum(['ASC', 'DESC']).optional(),
  page: z.number().min(0).default(0),
  size: z.number().min(1).max(100).default(20),
})
export type PostFacilitiesSearchBody = z.infer<typeof postFacilitiesSearchBodySchema>

// 서버 CareFacilityListResponse 대응
export const postFacilitiesSearchResponseSchema = z.object({
  facilities: facilityListSchema.nullish().transform((v) => v ?? []),
  totalCount: z.number().nullish(),
  currentPage: z.number().nullish(),
  totalPages: z.number().nullish(),
  hasNext: z.boolean().nullish(),
  hasPrevious: z.boolean().nullish(),
})
export type PostFacilitiesSearchResponse = z.infer<typeof postFacilitiesSearchResponseSchema>

/**
 * POST /facilities/advanced-search - 서버 CareFacilityAdvancedSearchRequest 대응.
 *
 * 키워드·지역으로 좁히는 `/facilities/search` 와 달리 조건(정원 여유·보육료·평점)으로 거른다.
 * 응답도 페이지가 아니라 배열이다.
 */
export const facilityAdvancedSearchBodySchema = z.object({
  facilityType: z.enum(FacilityType).optional(),
  isPublic: z.boolean().optional(),
  subsidyAvailable: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  /** 남은 정원. 대기 없이 바로 보낼 수 있는 곳을 찾을 때 쓴다 */
  minAvailableSpots: z.number().min(0).optional(),
  maxTuitionFee: z.number().min(0).optional(),
  /** 아이 월령. 반 편성이 맞는 곳만 남긴다 */
  childAge: z.number().min(0).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['ASC', 'DESC']).optional(),
})
export type FacilityAdvancedSearchBody = z.infer<typeof facilityAdvancedSearchBodySchema>

// GET /facilities/statistics
export const getFacilityStatisticsResponseSchema = z.record(z.unknown())
export type GetFacilityStatisticsResponse = z.infer<typeof getFacilityStatisticsResponseSchema>

// ==================== 리뷰 ====================

// 서버 ReviewResponse 대응
export const facilityReviewSchema = z.object({
  reviewId: z.number(),
  facilityId: z.number().nullish(),
  userId: z.string().nullish(),
  rating: z.number().nullish(),
  content: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type FacilityReview = z.infer<typeof facilityReviewSchema>
export const facilityReviewListSchema = z.array(facilityReviewSchema)

// POST /facilities/{id}/reviews, PUT /facilities/reviews/{reviewId}
export const facilityReviewBodySchema = z.object({
  rating: z.number().min(1, '별점을 선택해주세요').max(5),
  content: z.string().min(1, '리뷰 내용을 입력해주세요').max(1000),
})
export type FacilityReviewBody = z.infer<typeof facilityReviewBodySchema>

// ==================== 예약 ====================

export const BookingType = ['VISIT', 'REGULAR', 'TEMPORARY'] as const
export type BookingType = (typeof BookingType)[number]

export const BOOKING_TYPE_LABEL: Record<BookingType, string> = {
  VISIT: '방문 상담',
  REGULAR: '정기 이용',
  TEMPORARY: '일시 보육',
}

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: '승인 대기',
  CONFIRMED: '예약 확정',
  CANCELLED: '취소됨',
  COMPLETED: '이용 완료',
  REJECTED: '반려됨',
}

// 서버 BookingResponse 대응
export const bookingSchema = z.object({
  id: z.number(),
  facilityId: z.number().nullish(),
  facilityName: z.string().nullish(),
  userId: z.string().nullish(),
  childName: z.string().nullish(),
  childAge: z.number().nullish(),
  parentName: z.string().nullish(),
  parentPhone: z.string().nullish(),
  bookingType: z.string().nullish(),
  status: z.string().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  specialRequirements: z.string().nullish(),
  notes: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type Booking = z.infer<typeof bookingSchema>
export const bookingListSchema = z.array(bookingSchema)

// POST /facilities/{facilityId}/bookings - 서버 CreateBookingRequest 대응
export const postFacilityBookPathSchema = z.object({
  facilityId: z.number(),
})
export type PostFacilityBookPath = z.infer<typeof postFacilityBookPathSchema>

export const postFacilityBookBodySchema = z.object({
  childName: z.string().min(1, '아이 이름을 입력해주세요'),
  childAge: z.number().min(0).max(19),
  parentName: z.string().min(1, '보호자 이름을 입력해주세요'),
  parentPhone: z.string().min(1, '연락처를 입력해주세요'),
  bookingType: z.enum(BookingType),
  startTime: z.string(), // ISO LocalDateTime (yyyy-MM-ddTHH:mm:ss)
  endTime: z.string().optional(),
  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
})
export type PostFacilityBookBody = z.infer<typeof postFacilityBookBodySchema>
export const postFacilityBookResponseSchema = bookingSchema
export type PostFacilityBookResponse = z.infer<typeof postFacilityBookResponseSchema>

// PUT /facilities/bookings/{bookingId}/status
export const putBookingStatusQuerySchema = z.object({
  status: z.string(),
})
export type PutBookingStatusQuery = z.infer<typeof putBookingStatusQuerySchema>
