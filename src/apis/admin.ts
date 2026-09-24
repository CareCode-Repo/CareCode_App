import { CareCode } from './interceptor'
import {
  AdminBookingSearch,
  adminBookingSearchQuerySchema,
  AdminBookingSearchQuery,
  adminBookingSearchSchema,
  AdminBookingStats,
  adminBookingStatsSchema,
  AdminBookingStatusBody,
  adminBookingStatusBodySchema,
  AdminDashboard,
  adminDashboardSchema,
  AdminHealthRecordPage,
  adminHealthRecordPageSchema,
  AdminHospitalPage,
  adminHospitalPageSchema,
  AdminNotification,
  AdminNotificationCreateBody,
  adminNotificationCreateBodySchema,
  AdminNotificationPage,
  adminNotificationPageSchema,
  adminNotificationSchema,
  AdminPolicyBody,
  adminPolicyBodySchema,
  AdminPolicyDetail,
  adminPolicyDetailSchema,
  AdminPolicyPage,
  adminPolicyPageSchema,
  AdminPolicyPatchBody,
  adminPolicyPatchBodySchema,
  AdminPostPage,
  adminPostPageSchema,
  AdminUser,
  adminUserPageSchema,
  AdminUserPage,
  adminUserSchema,
  AdminUserUpdateBody,
  adminUserUpdateBodySchema,
  DateRangeQuery,
  dateRangeQuerySchema,
  EventCounts,
  eventCountsSchema,
  Funnel,
  funnelSchema,
  PendingReportPage,
  pendingReportPageSchema,
  PolicyVerificationStatus,
  policyVerificationStatusListSchema,
  PolicyVerifyResult,
  policyVerifyResultSchema,
  ReportStatus,
  Retention,
  retentionSchema,
  SyncResult,
  syncResultSchema,
  SyncTarget,
} from '@/types/apis/admin'

// GET /api/admin/dashboard
export const getAdminDashboard = async (): Promise<AdminDashboard> => {
  const res = await CareCode.get('/api/admin/dashboard')
  return adminDashboardSchema.parse(res.data)
}

// ==================== 지표 ====================

// GET /api/admin/analytics/funnel - 미지정 시 서버가 최근 30일로 잡는다
export const getFunnel = async (query: DateRangeQuery = {}): Promise<Funnel> => {
  const parsedQuery = dateRangeQuerySchema.parse(query)
  const res = await CareCode.get('/api/admin/analytics/funnel', { params: parsedQuery })
  return funnelSchema.parse(res.data)
}

// GET /api/admin/analytics/retention
export const getRetention = async (query: DateRangeQuery = {}): Promise<Retention> => {
  const parsedQuery = dateRangeQuerySchema.parse(query)
  const res = await CareCode.get('/api/admin/analytics/retention', { params: parsedQuery })
  return retentionSchema.parse(res.data)
}

// GET /api/admin/analytics/events
export const getEventCounts = async (query: DateRangeQuery = {}): Promise<EventCounts> => {
  const parsedQuery = dateRangeQuerySchema.parse(query)
  const res = await CareCode.get('/api/admin/analytics/events', { params: parsedQuery })
  return eventCountsSchema.parse(res.data)
}

// ==================== 정책 검증 ====================

// GET /api/admin/policies/verification-status - 검증률 낮은 지역 순
export const getPolicyVerificationStatus = async (): Promise<PolicyVerificationStatus[]> => {
  const res = await CareCode.get('/api/admin/policies/verification-status')
  return policyVerificationStatusListSchema.parse(res.data)
}

// POST /api/admin/policies/{policyId}/verify
export const postPolicyVerify = async (
  policyId: number,
  sourceUrl?: string,
): Promise<PolicyVerifyResult> => {
  const res = await CareCode.post(`/api/admin/policies/${policyId}/verify`, null, {
    params: sourceUrl ? { sourceUrl } : {},
  })
  return policyVerifyResultSchema.parse(res.data)
}

// DELETE /api/admin/policies/{policyId}/verify - 추정치로 되돌림
export const deletePolicyVerify = async (policyId: number): Promise<void> => {
  await CareCode.delete(`/api/admin/policies/${policyId}/verify`)
}

// ==================== 신고 처리 ====================

// GET /api/admin/reports
export const getPendingReports = async (page = 0, size = 50): Promise<PendingReportPage> => {
  const res = await CareCode.get('/api/admin/reports', { params: { page, size } })
  return pendingReportPageSchema.parse(res.data)
}

// PATCH /api/admin/reports/{reportId} - ACCEPTED 로 처리하면 대상이 숨김 처리된다
export const patchReportStatus = async (
  reportId: number,
  status: ReportStatus,
  note?: string,
): Promise<void> => {
  await CareCode.patch(`/api/admin/reports/${reportId}`, null, {
    params: note ? { status, note } : { status },
  })
}

// ==================== 사용자 관리 ====================

// GET /api/admin/users
export const getAdminUsers = async (page = 0, size = 50): Promise<AdminUserPage> => {
  const res = await CareCode.get('/api/admin/users', { params: { page, size } })
  return adminUserPageSchema.parse(res.data)
}

// PATCH /api/admin/users/{id} - 이름·연락처·역할·활성 상태만 변경 가능
export const patchAdminUser = async (id: number, body: AdminUserUpdateBody): Promise<AdminUser> => {
  const parsedBody = adminUserUpdateBodySchema.parse(body)
  const res = await CareCode.patch(`/api/admin/users/${id}`, parsedBody)
  return adminUserSchema.parse(res.data)
}

// DELETE /api/admin/users/{id}
export const deleteAdminUser = async (id: number): Promise<void> => {
  await CareCode.delete(`/api/admin/users/${id}`)
}

// ==================== 커뮤니티 관리 ====================

// GET /api/admin/community/posts
export const getAdminPosts = async (page = 0, size = 50): Promise<AdminPostPage> => {
  const res = await CareCode.get('/api/admin/community/posts', { params: { page, size } })
  return adminPostPageSchema.parse(res.data)
}

// DELETE /api/admin/community/posts/{id}
export const deleteAdminPost = async (id: number): Promise<void> => {
  await CareCode.delete(`/api/admin/community/posts/${id}`)
}

// ==================== 예약 관리 ====================

// GET /api/admin/facilities/bookings
export const getAdminBookings = async (
  query: AdminBookingSearchQuery = {},
): Promise<AdminBookingSearch> => {
  const parsedQuery = adminBookingSearchQuerySchema.parse(query)
  const res = await CareCode.get('/api/admin/facilities/bookings', { params: parsedQuery })
  return adminBookingSearchSchema.parse(res.data)
}

// GET /api/admin/facilities/bookings/today
export const getTodayBookings = async (page = 0, size = 20): Promise<AdminBookingSearch> => {
  const res = await CareCode.get('/api/admin/facilities/bookings/today', {
    params: { page, size },
  })
  return adminBookingSearchSchema.parse(res.data)
}

// GET /api/admin/facilities/bookings/statistics
export const getBookingStats = async (): Promise<AdminBookingStats> => {
  const res = await CareCode.get('/api/admin/facilities/bookings/statistics')
  return adminBookingStatsSchema.parse(res.data)
}

// PATCH /api/admin/facilities/bookings/{bookingId}/status
export const patchBookingStatus = async (
  bookingId: number,
  body: AdminBookingStatusBody,
): Promise<void> => {
  const parsedBody = adminBookingStatusBodySchema.parse(body)
  await CareCode.patch(`/api/admin/facilities/bookings/${bookingId}/status`, parsedBody)
}

// DELETE /api/admin/facilities/bookings/{bookingId}
export const deleteAdminBooking = async (bookingId: number): Promise<void> => {
  await CareCode.delete(`/api/admin/facilities/bookings/${bookingId}`)
}

// ==================== 정책 관리 ====================

// GET /api/admin/policies
export const getAdminPolicies = async (page = 0, size = 50): Promise<AdminPolicyPage> => {
  const res = await CareCode.get('/api/admin/policies', { params: { page, size } })
  return adminPolicyPageSchema.parse(res.data)
}

// POST /api/admin/policies - 재배포 없이 새 정책 추가
export const postAdminPolicy = async (body: AdminPolicyBody): Promise<AdminPolicyDetail> => {
  const parsedBody = adminPolicyBodySchema.parse(body)
  const res = await CareCode.post('/api/admin/policies', parsedBody)
  return adminPolicyDetailSchema.parse(res.data)
}

// PUT /api/admin/policies/{id} - 전체 교체. 보내지 않은 항목은 null 이 된다.
export const putAdminPolicy = async (
  id: number,
  body: AdminPolicyBody,
): Promise<AdminPolicyDetail> => {
  const parsedBody = adminPolicyBodySchema.parse(body)
  const res = await CareCode.put(`/api/admin/policies/${id}`, parsedBody)
  return adminPolicyDetailSchema.parse(res.data)
}

/**
 * PATCH /api/admin/policies/{id} - 부분 수정.
 *
 * zod 의 `.parse` 는 결과 객체에서 undefined 키를 지우지 않지만 JSON 직렬화 단계에서 사라진다.
 * 즉 "보내지 않음(유지)" 은 undefined, "비우기" 는 null 로 표현하면 그대로 서버에 전달된다.
 */
export const patchAdminPolicy = async (
  id: number,
  body: AdminPolicyPatchBody,
): Promise<AdminPolicyDetail> => {
  const parsedBody = adminPolicyPatchBodySchema.parse(body)
  const res = await CareCode.patch(`/api/admin/policies/${id}`, parsedBody)
  return adminPolicyDetailSchema.parse(res.data)
}

// DELETE /api/admin/policies/{id}
export const deleteAdminPolicy = async (id: number): Promise<void> => {
  await CareCode.delete(`/api/admin/policies/${id}`)
}

// ==================== 병원 관리 ====================

// GET /api/admin/hospitals
export const getAdminHospitals = async (page = 0, size = 50): Promise<AdminHospitalPage> => {
  const res = await CareCode.get('/api/admin/hospitals', { params: { page, size } })
  return adminHospitalPageSchema.parse(res.data)
}

// DELETE /api/admin/hospitals/{id}
export const deleteAdminHospital = async (id: number): Promise<void> => {
  await CareCode.delete(`/api/admin/hospitals/${id}`)
}

// ==================== 건강기록 관리 ====================

// GET /api/admin/health/records
export const getAdminHealthRecords = async (
  page = 0,
  size = 50,
): Promise<AdminHealthRecordPage> => {
  const res = await CareCode.get('/api/admin/health/records', { params: { page, size } })
  return adminHealthRecordPageSchema.parse(res.data)
}

// DELETE /api/admin/health/records/{id}
export const deleteAdminHealthRecord = async (id: number): Promise<void> => {
  await CareCode.delete(`/api/admin/health/records/${id}`)
}

// ==================== 알림 관리 ====================

// GET /api/admin/notifications
export const getAdminNotifications = async (
  page = 0,
  size = 50,
): Promise<AdminNotificationPage> => {
  const res = await CareCode.get('/api/admin/notifications', { params: { page, size } })
  return adminNotificationPageSchema.parse(res.data)
}

// POST /api/admin/notifications - 특정 사용자에게 알림 생성
export const postAdminNotification = async (
  body: AdminNotificationCreateBody,
): Promise<AdminNotification> => {
  const parsedBody = adminNotificationCreateBodySchema.parse(body)
  const res = await CareCode.post('/api/admin/notifications', parsedBody)
  return adminNotificationSchema.parse(res.data)
}

// DELETE /api/admin/notifications/{id}
export const deleteAdminNotification = async (id: number): Promise<void> => {
  await CareCode.delete(`/api/admin/notifications/${id}`)
}

// ==================== 공공데이터 동기화 ====================

/** 대상별 엔드포인트가 달라 매핑해 둔다. */
const SYNC_PATH: Record<SyncTarget, string> = {
  facilities: '/api/admin/public-data/facilities/sync',
  kindergartens: '/api/admin/public-data/kindergartens/sync',
  benefits: '/api/admin/public-data/benefits/sync',
  hospitals: '/api/admin/public-data/hospitals/sync',
  geocode: '/api/admin/public-data/facilities/geocode',
}

// 외부 API 를 순회하므로 오래 걸린다. 기본 타임아웃(30초)으로는 부족하다.
const SYNC_TIMEOUT_MS = 10 * 60 * 1000

export const postPublicDataSync = async (target: SyncTarget): Promise<SyncResult> => {
  const res = await CareCode.post(SYNC_PATH[target], null, { timeout: SYNC_TIMEOUT_MS })
  return syncResultSchema.parse(res.data)
}

// ==================== 샘플 데이터 (개발용) ====================

export const postSeedSampleData = async (): Promise<Record<string, number>> => {
  const res = await CareCode.post('/api/admin/dev/sample-data')
  return res.data
}

export const deleteSampleData = async (): Promise<Record<string, number>> => {
  const res = await CareCode.delete('/api/admin/dev/sample-data')
  return res.data
}
