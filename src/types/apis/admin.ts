import { z } from 'zod'
import { healthRecordSchema } from './health'
import { hospitalSchema } from './hospital'
import { reportSchema } from './moderation'
import { USER_ROLE, USER_ROLE_LABEL, type UserRoleValue } from './user'

// ==================== 퍼널 ====================

// 서버 FunnelResponse 대응
export const funnelStepSchema = z.object({
  event: z.string(),
  label: z.string().nullish(),
  users: z.number().default(0),
  /** 직전 단계 대비 전환율(%). 첫 단계는 null */
  conversionRate: z.number().nullish(),
})
export type FunnelStep = z.infer<typeof funnelStepSchema>

export const funnelSchema = z.object({
  from: z.string().nullish(),
  to: z.string().nullish(),
  steps: z
    .array(funnelStepSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type Funnel = z.infer<typeof funnelSchema>

// ==================== 리텐션 ====================

// 서버 RetentionResponse.Cohort 대응
export const retentionCohortSchema = z.object({
  signUpDate: z.string(),
  signedUp: z.number().default(0),
  /** D1/D7/D30 잔존율(%). 아직 그날이 오지 않았으면 null */
  day1: z.number().nullish(),
  day7: z.number().nullish(),
  day30: z.number().nullish(),
})
export type RetentionCohort = z.infer<typeof retentionCohortSchema>

export const retentionSchema = z.object({
  cohorts: z
    .array(retentionCohortSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type Retention = z.infer<typeof retentionSchema>

// ==================== 이벤트 집계 ====================

export const eventCountsSchema = z.record(z.number())
export type EventCounts = z.infer<typeof eventCountsSchema>

/** 이벤트 코드를 화면 문구로. 매핑에 없으면 코드 그대로 보여준다. */
export const EVENT_LABEL: Record<string, string> = {
  SIGNED_UP: '가입',
  CHILD_REGISTERED: '아이 등록',
  POLICY_VIEWED: '정책 조회',
  BENEFIT_LINK_CLICKED: '지원금 신청 클릭',
  HEALTH_RECORD_CREATED: '건강 기록 작성',
  FACILITY_SEARCHED: '시설 검색',
  COMMUNITY_POST_CREATED: '게시글 작성',
}

// ==================== 정책 검증 ====================

// 서버 verification-status 응답 (Map 리스트) 대응
export const policyVerificationStatusSchema = z.object({
  region: z.string(),
  total: z.number().default(0),
  verified: z.number().default(0),
  unverified: z.number().default(0),
  /** 검증률(%) */
  verifiedRate: z.number().default(0),
})
export type PolicyVerificationStatus = z.infer<typeof policyVerificationStatusSchema>
export const policyVerificationStatusListSchema = z.array(policyVerificationStatusSchema)

export const policyVerifyResultSchema = z.object({
  policyId: z.number(),
  title: z.string().nullish(),
  verifiedAt: z.string().nullish(),
  verifiedBy: z.string().nullish(),
})
export type PolicyVerifyResult = z.infer<typeof policyVerifyResultSchema>

// ==================== 신고 처리 ====================

export const ReportStatus = ['PENDING', 'ACCEPTED', 'REJECTED'] as const
export type ReportStatus = (typeof ReportStatus)[number]

/** 서버 Page<ReportResponse> 대응. 페이지 메타는 화면에서 쓰는 것만 읽는다. */
export const pendingReportPageSchema = z.object({
  content: z
    .array(reportSchema)
    .nullish()
    .transform((v) => v ?? []),
  totalElements: z.number().nullish(),
  totalPages: z.number().nullish(),
  number: z.number().nullish(),
  last: z.boolean().nullish(),
})
export type PendingReportPage = z.infer<typeof pendingReportPageSchema>

// ==================== 대시보드 ====================

export const adminActivitySchema = z.object({
  type: z.string().nullish(),
  desc: z.string().nullish(),
  time: z.string().nullish(),
})
export type AdminActivity = z.infer<typeof adminActivitySchema>

/**
 * 서버가 Map 으로 조립해 주는 응답이라 키 단위로 읽는다.
 * 항목이 늘어나도 화면이 깨지지 않도록 모두 nullish 로 둔다.
 */
export const adminDashboardSchema = z.object({
  userCount: z.number().nullish(),
  hospitalCount: z.number().nullish(),
  policyCount: z.number().nullish(),
  recentActivities: z
    .array(adminActivitySchema)
    .nullish()
    .transform((v) => v ?? []),
  userTrendLabels: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  userTrendData: z
    .array(z.number())
    .nullish()
    .transform((v) => v ?? []),
})
export type AdminDashboard = z.infer<typeof adminDashboardSchema>

// ==================== 사용자 관리 ====================

// 역할 목록·표기는 user.ts 가 정본이다. 두 벌로 두면 한쪽만 고쳐져 조용히 어긋난다.
export const UserRole = USER_ROLE
export type UserRole = UserRoleValue
export { USER_ROLE_LABEL }

// 서버 AdminUserResponse 대응
export const adminUserSchema = z.object({
  id: z.number(),
  userId: z.string().nullish(),
  email: z.string().nullish(),
  name: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  role: z.string().nullish(),
  isActive: z.boolean().nullish(),
  emailVerified: z.boolean().nullish(),
  lastLoginAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  /** 탈퇴 시각. 있으면 소프트 삭제된 계정이다 */
  deletedAt: z.string().nullish(),
})
export type AdminUser = z.infer<typeof adminUserSchema>

/** 서버 AdminUserUpdateRequest 대응. 어드민이 바꿀 수 있는 항목만 담는다. */
export const adminUserUpdateBodySchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(UserRole).optional(),
  isActive: z.boolean().optional(),
})
export type AdminUserUpdateBody = z.infer<typeof adminUserUpdateBodySchema>

// ==================== 커뮤니티 관리 ====================

// 서버 CommunityPostResponse 대응 (관리 목록용으로 느슨하게 받는다)
export const adminPostSchema = z.object({
  postId: z.number(),
  title: z.string().nullish(),
  content: z.string().nullish(),
  category: z.string().nullish(),
  authorName: z.string().nullish(),
  authorId: z.string().nullish(),
  isAnonymous: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  viewCount: z.number().nullish(),
  likeCount: z.number().nullish(),
  commentCount: z.number().nullish(),
})
export type AdminPost = z.infer<typeof adminPostSchema>

// ==================== 페이지 응답 ====================

/**
 * Spring Page 응답 중 화면에서 쓰는 필드만 읽는 헬퍼.
 * 내부에서만 쓰므로 내보내지 않는다 (복잡한 추론 타입을 외부 계약으로 만들 이유가 없다).
 */
const pageSchemaOf = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    content: z
      .array(item)
      .nullish()
      .transform((v) => v ?? []),
    totalElements: z.number().nullish(),
    totalPages: z.number().nullish(),
    number: z.number().nullish(),
    last: z.boolean().nullish(),
  })

export const adminUserPageSchema = pageSchemaOf(adminUserSchema)
export type AdminUserPage = z.infer<typeof adminUserPageSchema>

export const adminPostPageSchema = pageSchemaOf(adminPostSchema)
export type AdminPostPage = z.infer<typeof adminPostPageSchema>

export const adminHospitalPageSchema = pageSchemaOf(hospitalSchema)
export type AdminHospitalPage = z.infer<typeof adminHospitalPageSchema>

// 정책 페이지 스키마는 adminPolicyDetailSchema 정의 뒤(정책 관리 섹션)에 둔다.

export const adminHealthRecordPageSchema = pageSchemaOf(healthRecordSchema)
export type AdminHealthRecordPage = z.infer<typeof adminHealthRecordPageSchema>

// 알림 페이지 스키마는 adminNotificationSchema 정의 뒤(알림 관리 섹션)에 둔다.

// ==================== 예약 관리 ====================

export const BookingStatus = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const
export type BookingStatus = (typeof BookingStatus)[number]

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: '승인 대기',
  CONFIRMED: '확정',
  COMPLETED: '이용 완료',
  CANCELLED: '취소',
  REJECTED: '반려',
}

// 서버 AdminBookingListResponse 대응
export const adminBookingSchema = z.object({
  id: z.number(),
  facilityId: z.number().nullish(),
  facilityName: z.string().nullish(),
  userId: z.string().nullish(),
  userName: z.string().nullish(),
  childName: z.string().nullish(),
  bookingType: z.string().nullish(),
  status: z.string().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  createdAt: z.string().nullish(),
})
export type AdminBooking = z.infer<typeof adminBookingSchema>

// 서버 AdminBookingSearchResponse 대응 (Spring Page 가 아니라 자체 포맷이다)
export const adminBookingSearchSchema = z.object({
  bookings: z
    .array(adminBookingSchema)
    .nullish()
    .transform((v) => v ?? []),
  totalElements: z.number().nullish(),
  totalPages: z.number().nullish(),
  currentPage: z.number().nullish(),
  pageSize: z.number().nullish(),
  hasNext: z.boolean().nullish(),
  hasPrevious: z.boolean().nullish(),
})
export type AdminBookingSearch = z.infer<typeof adminBookingSearchSchema>

// 서버 AdminBookingStatsResponse 대응 (화면에서 쓰는 집계만 읽는다)
export const adminBookingStatsSchema = z.object({
  totalBookings: z.number().nullish(),
  pendingBookings: z.number().nullish(),
  confirmedBookings: z.number().nullish(),
  completedBookings: z.number().nullish(),
  cancelledBookings: z.number().nullish(),
  todayBookings: z.number().nullish(),
  thisWeekBookings: z.number().nullish(),
  thisMonthBookings: z.number().nullish(),
  averageCompletionRate: z.number().nullish(),
})
export type AdminBookingStats = z.infer<typeof adminBookingStatsSchema>

// 서버 AdminStatusUpdateRequest 대응
export const adminBookingStatusBodySchema = z.object({
  status: z.enum(BookingStatus),
  /** 취소·반려 사유. 사용자에게 전달되므로 상태를 되돌릴 때는 남겨두는 편이 낫다 */
  reason: z.string().optional(),
  adminNote: z.string().optional(),
})
export type AdminBookingStatusBody = z.infer<typeof adminBookingStatusBodySchema>

export const adminBookingSearchQuerySchema = z.object({
  page: z.number().min(0).optional(),
  size: z.number().min(1).max(100).optional(),
  facilityId: z.number().optional(),
  status: z.string().optional(),
  keyword: z.string().optional(),
})
export type AdminBookingSearchQuery = z.infer<typeof adminBookingSearchQuerySchema>

// ==================== 정책 관리 ====================

/**
 * 서버 AdminPolicyDetailResponse 대응.
 *
 * 사용자용 PolicyDto 는 신청 기간을 문자열로 합치고 policyCode 를 빼는 등 값을 가공해서
 * 수정 화면을 채울 수 없다. 어드민 조회는 수정 요청과 1:1 로 대응하는 원본 값을 받는다.
 */
export const adminPolicyDetailSchema = z.object({
  id: z.number(),
  policyCode: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  policyType: z.string().nullish(),
  targetAgeMin: z.number().nullish(),
  targetAgeMax: z.number().nullish(),
  targetRegion: z.string().nullish(),
  benefitAmount: z.number().nullish(),
  benefitType: z.string().nullish(),
  applicationStartDate: z.string().nullish(), // yyyy-MM-dd
  applicationEndDate: z.string().nullish(),
  policyStartDate: z.string().nullish(),
  policyEndDate: z.string().nullish(),
  applicationUrl: z.string().nullish(),
  contactInfo: z.string().nullish(),
  requiredDocuments: z.string().nullish(),
  isActive: z.boolean().nullish(),
  priority: z.number().nullish(),
  policyCategoryId: z.number().nullish(),

  // 참고용 (수정 대상 아님)
  policyCategoryName: z.string().nullish(),
  /** 금액이 수기 검증된 시각. null 이면 자동 수집된 추정치 */
  verifiedAt: z.string().nullish(),
  verifiedBy: z.string().nullish(),
  sourceUrl: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type AdminPolicyDetail = z.infer<typeof adminPolicyDetailSchema>

/**
 * 서버 AdminPolicyRequest 대응 (등록 / 전체 교체용).
 *
 * PUT 은 이 값으로 정책 전체를 덮어쓴다. 일부만 고칠 때는 PATCH(adminPolicyPatchBodySchema)를 쓴다.
 */
export const adminPolicyBodySchema = z.object({
  policyCode: z.string().min(1, '정책 코드를 입력해주세요').max(50),
  title: z.string().min(1, '정책명을 입력해주세요').max(200),
  description: z.string().max(2000).optional(),
  policyType: z.string().max(50).optional(),
  targetAgeMin: z.number().min(0).optional(),
  targetAgeMax: z.number().min(0).optional(),
  targetRegion: z.string().max(100).optional(),
  benefitAmount: z.number().min(0).optional(),
  benefitType: z.string().max(50).optional(),
  applicationStartDate: z.string().optional(), // yyyy-MM-dd
  applicationEndDate: z.string().optional(),
  policyStartDate: z.string().optional(),
  policyEndDate: z.string().optional(),
  applicationUrl: z.string().max(500).optional(),
  contactInfo: z.string().max(200).optional(),
  requiredDocuments: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
  policyCategoryId: z.number().optional(),
})
export type AdminPolicyBody = z.infer<typeof adminPolicyBodySchema>

/**
 * 정책 부분 수정 요청 (PATCH).
 *
 * 서버는 **키의 존재 여부**로 판단한다.
 * - 키를 아예 넣지 않으면 → 기존 값 유지
 * - 키를 넣고 값을 주면 → 그 값으로 변경
 * - 키를 넣고 `null` 을 주면 → 해당 항목을 비움
 *
 * 그래서 "비우기" 를 표현하려면 `undefined` 가 아니라 `null` 을 담아야 한다.
 * (JSON 직렬화에서 undefined 는 키째 사라진다)
 */
export const adminPolicyPatchBodySchema = z.object({
  policyCode: z.string().min(1).max(50).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  policyType: z.string().max(50).nullable().optional(),
  targetAgeMin: z.number().min(0).nullable().optional(),
  targetAgeMax: z.number().min(0).nullable().optional(),
  targetRegion: z.string().max(100).nullable().optional(),
  benefitAmount: z.number().min(0).nullable().optional(),
  benefitType: z.string().max(50).nullable().optional(),
  applicationStartDate: z.string().nullable().optional(), // yyyy-MM-dd
  applicationEndDate: z.string().nullable().optional(),
  policyStartDate: z.string().nullable().optional(),
  policyEndDate: z.string().nullable().optional(),
  applicationUrl: z.string().max(500).nullable().optional(),
  contactInfo: z.string().max(200).nullable().optional(),
  requiredDocuments: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().nullable().optional(),
  policyCategoryId: z.number().nullable().optional(),
})
export type AdminPolicyPatchBody = z.infer<typeof adminPolicyPatchBodySchema>

export const adminPolicyPageSchema = pageSchemaOf(adminPolicyDetailSchema)
export type AdminPolicyPage = z.infer<typeof adminPolicyPageSchema>

// ==================== 알림 관리 ====================

export const NotificationType = ['POLICY', 'HEALTH', 'COMMUNITY', 'FACILITY', 'SYSTEM'] as const
export type NotificationType = (typeof NotificationType)[number]

export const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  POLICY: '정책',
  HEALTH: '건강',
  COMMUNITY: '커뮤니티',
  FACILITY: '시설',
  SYSTEM: '시스템',
}

// 서버 NotificationInfoResponse 대응
export const adminNotificationSchema = z.object({
  id: z.number(),
  userId: z.string().nullish(),
  notificationType: z.string().nullish(),
  title: z.string().nullish(),
  message: z.string().nullish(),
  priority: z.string().nullish(),
  isRead: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  readAt: z.string().nullish(),
  scheduledAt: z.string().nullish(),
  sentAt: z.string().nullish(),
  deliveryStatus: z.string().nullish(),
})
export type AdminNotification = z.infer<typeof adminNotificationSchema>

// 서버 AdminNotificationCreateRequest 대응
export const adminNotificationCreateBodySchema = z.object({
  /** 사용자 PK (userId 문자열이 아니라 숫자 ID 다) */
  userId: z.number(),
  notificationType: z.enum(NotificationType),
  title: z.string().min(1, '제목을 입력해주세요'),
  message: z.string().min(1, '내용을 입력해주세요'),
})
export type AdminNotificationCreateBody = z.infer<typeof adminNotificationCreateBodySchema>

export const adminNotificationPageSchema = pageSchemaOf(adminNotificationSchema)
export type AdminNotificationPage = z.infer<typeof adminNotificationPageSchema>

// ==================== 공공데이터 동기화 ====================

export const SYNC_TARGETS = [
  { key: 'facilities', label: '어린이집', description: '보육통합정보시스템' },
  { key: 'kindergartens', label: '유치원', description: '유치원알리미' },
  { key: 'benefits', label: '지원금 정책', description: '보조금24' },
  { key: 'hospitals', label: '병원', description: '건강보험심사평가원' },
  { key: 'geocode', label: '좌표 보정', description: '주소로 위경도 채우기' },
] as const
export type SyncTarget = (typeof SYNC_TARGETS)[number]['key']

/** 동기화 결과는 공급자마다 키가 달라 자유 형식으로 받는다. */
export const syncResultSchema = z.record(z.unknown())
export type SyncResult = z.infer<typeof syncResultSchema>

// ==================== 공통 ====================

export const dateRangeQuerySchema = z.object({
  from: z.string().optional(), // yyyy-MM-dd
  to: z.string().optional(),
})
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>
