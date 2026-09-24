import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import {
  deleteAdminBooking,
  deleteAdminHealthRecord,
  deleteAdminHospital,
  deleteAdminNotification,
  deleteAdminPolicy,
  deleteAdminPost,
  deleteAdminUser,
  deletePolicyVerify,
  getAdminBookings,
  getAdminDashboard,
  getAdminHealthRecords,
  getAdminHospitals,
  getAdminNotifications,
  getAdminPolicies,
  getAdminPosts,
  getAdminUsers,
  getBookingStats,
  getEventCounts,
  getFunnel,
  getPendingReports,
  getPolicyVerificationStatus,
  getRetention,
  patchAdminUser,
  patchBookingStatus,
  patchReportStatus,
  postAdminNotification,
  postAdminPolicy,
  postPolicyVerify,
  postPublicDataSync,
  patchAdminPolicy,
} from '@/apis/admin'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { communityQueries } from '@/queries/community'
import { facilityQueries } from '@/queries/facility'
import { healthQueries } from '@/queries/health'
import { hospitalQueries } from '@/queries/hospital'
import { policyQueryKeys } from '@/queries/policy'
import {
  AdminBookingSearch,
  AdminBookingSearchQuery,
  AdminBookingStats,
  AdminBookingStatusBody,
  AdminDashboard,
  AdminHealthRecordPage,
  AdminHospitalPage,
  AdminNotification,
  AdminNotificationCreateBody,
  AdminNotificationPage,
  AdminPolicyBody,
  AdminPolicyDetail,
  AdminPolicyPatchBody,
  AdminPolicyPage,
  AdminPostPage,
  AdminUser,
  AdminUserPage,
  AdminUserUpdateBody,
  DateRangeQuery,
  EventCounts,
  Funnel,
  PendingReportPage,
  PolicyVerificationStatus,
  PolicyVerifyResult,
  ReportStatus,
  Retention,
  SyncResult,
  SyncTarget,
} from '@/types/apis/admin'

export const adminQueries = createQueryKeys('admin', {
  dashboard: () => ({
    queryKey: ['dashboard'],
    queryFn: getAdminDashboard,
  }),

  funnel: (query: DateRangeQuery) => ({
    queryKey: ['analytics', 'funnel', query],
    queryFn: () => getFunnel(query),
  }),

  retention: (query: DateRangeQuery) => ({
    queryKey: ['analytics', 'retention', query],
    queryFn: () => getRetention(query),
  }),

  events: (query: DateRangeQuery) => ({
    queryKey: ['analytics', 'events', query],
    queryFn: () => getEventCounts(query),
  }),

  verificationStatus: () => ({
    queryKey: ['policies', 'verification-status'],
    queryFn: getPolicyVerificationStatus,
  }),

  reports: (page: number) => ({
    queryKey: ['reports', page],
    queryFn: () => getPendingReports(page),
  }),

  users: (page: number) => ({
    queryKey: ['users', page],
    queryFn: () => getAdminUsers(page),
  }),

  posts: (page: number) => ({
    queryKey: ['posts', page],
    queryFn: () => getAdminPosts(page),
  }),

  bookings: (query: AdminBookingSearchQuery) => ({
    queryKey: ['bookings', query],
    queryFn: () => getAdminBookings(query),
  }),

  bookingStats: () => ({
    queryKey: ['bookings', 'stats'],
    queryFn: getBookingStats,
  }),

  policies: (page: number) => ({
    queryKey: ['policies', page],
    queryFn: () => getAdminPolicies(page),
  }),

  hospitals: (page: number) => ({
    queryKey: ['hospitals', page],
    queryFn: () => getAdminHospitals(page),
  }),

  healthRecords: (page: number) => ({
    queryKey: ['health-records', page],
    queryFn: () => getAdminHealthRecords(page),
  }),

  notifications: (page: number) => ({
    queryKey: ['notifications', page],
    queryFn: () => getAdminNotifications(page),
  }),
})

/**
 * 어드민 조회는 관리자에게만 의미가 있다.
 * 권한 없는 사용자가 켜면 매번 403 이 쌓이므로 역할을 확인한 뒤에만 요청한다.
 */

export const useAdminDashboard = (): UseQueryResult<AdminDashboard, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.dashboard(), enabled: isAdmin })
}

export const useFunnel = (query: DateRangeQuery = {}): UseQueryResult<Funnel, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.funnel(query), enabled: isAdmin })
}

export const useRetention = (query: DateRangeQuery = {}): UseQueryResult<Retention, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.retention(query), enabled: isAdmin })
}

export const useEventCounts = (query: DateRangeQuery = {}): UseQueryResult<EventCounts, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.events(query), enabled: isAdmin })
}

export const usePolicyVerificationStatus = (): UseQueryResult<
  PolicyVerificationStatus[],
  Error
> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.verificationStatus(), enabled: isAdmin })
}

export const usePendingReports = (page = 0): UseQueryResult<PendingReportPage, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.reports(page), enabled: isAdmin })
}

export const useVerifyPolicy = (): UseMutationResult<
  PolicyVerifyResult,
  Error,
  { policyId: number; sourceUrl?: string }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, sourceUrl }) => postPolicyVerify(policyId, sourceUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.verificationStatus().queryKey })
      // 검증 여부가 사용자 화면의 금액 신뢰도 표기에 반영된다.
      queryClient.invalidateQueries({ queryKey: policyQueryKeys._def })
    },
  })
}

export const useUnverifyPolicy = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePolicyVerify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.verificationStatus().queryKey })
      queryClient.invalidateQueries({ queryKey: policyQueryKeys._def })
    },
  })
}

export const useAdminUsers = (page = 0): UseQueryResult<AdminUserPage, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.users(page), enabled: isAdmin })
}

export const useAdminPosts = (page = 0): UseQueryResult<AdminPostPage, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.posts(page), enabled: isAdmin })
}

export const useUpdateAdminUser = (): UseMutationResult<
  AdminUser,
  Error,
  { id: number; body: AdminUserUpdateBody }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }) => patchAdminUser(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.users._def })
    },
  })
}

export const useDeleteAdminUser = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.users._def })
    },
  })
}

export const useDeleteAdminPost = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdminPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.posts._def })
      // 관리자 삭제는 사용자 화면의 목록에도 반영돼야 한다.
      queryClient.invalidateQueries({ queryKey: communityQueries._def })
    },
  })
}

// ==================== 예약 ====================

export const useAdminBookings = (
  query: AdminBookingSearchQuery = {},
): UseQueryResult<AdminBookingSearch, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.bookings(query), enabled: isAdmin })
}

export const useBookingStats = (): UseQueryResult<AdminBookingStats, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.bookingStats(), enabled: isAdmin })
}

export const useUpdateBookingStatus = (): UseMutationResult<
  void,
  Error,
  { bookingId: number; body: AdminBookingStatusBody }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, body }) => patchBookingStatus(bookingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.bookings._def })
      // 사용자의 "내 예약" 화면에도 즉시 반영돼야 한다.
      queryClient.invalidateQueries({ queryKey: facilityQueries.myBookings().queryKey })
    },
  })
}

/**
 * 예약 레코드 영구 삭제.
 * 화면에서는 상태 변경(취소)을 기본으로 쓴다 — 삭제하면 누가 언제 취소했는지 기록이 사라진다.
 */
export const useDeleteAdminBooking = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdminBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.bookings._def })
      queryClient.invalidateQueries({ queryKey: facilityQueries.myBookings().queryKey })
    },
  })
}

// ==================== 정책 ====================

export const useAdminPolicies = (page = 0): UseQueryResult<AdminPolicyPage, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.policies(page), enabled: isAdmin })
}

/** 정책 변경은 사용자 화면의 목록·추천·지역 비교에 모두 영향을 준다. */
const invalidatePolicyViews = (queryClient: ReturnType<typeof useQueryClient>): void => {
  queryClient.invalidateQueries({ queryKey: adminQueries.policies._def })
  queryClient.invalidateQueries({ queryKey: adminQueries.verificationStatus().queryKey })
  queryClient.invalidateQueries({ queryKey: policyQueryKeys._def })
}

export const useCreateAdminPolicy = (): UseMutationResult<
  AdminPolicyDetail,
  Error,
  AdminPolicyBody
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postAdminPolicy,
    onSuccess: () => invalidatePolicyViews(queryClient),
  })
}

/**
 * 정책 수정.
 * PATCH 라서 보내지 않은 항목은 서버가 그대로 둔다 (PUT 은 전체 교체라 값이 지워진다).
 */
export const useUpdateAdminPolicy = (): UseMutationResult<
  AdminPolicyDetail,
  Error,
  { id: number; body: AdminPolicyPatchBody }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }) => patchAdminPolicy(id, body),
    onSuccess: () => invalidatePolicyViews(queryClient),
  })
}

export const useDeleteAdminPolicy = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdminPolicy,
    onSuccess: () => invalidatePolicyViews(queryClient),
  })
}

// ==================== 병원 / 건강기록 / 알림 ====================

export const useAdminHospitals = (page = 0): UseQueryResult<AdminHospitalPage, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.hospitals(page), enabled: isAdmin })
}

export const useDeleteAdminHospital = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdminHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.hospitals._def })
      queryClient.invalidateQueries({ queryKey: hospitalQueries._def })
    },
  })
}

export const useAdminHealthRecords = (page = 0): UseQueryResult<AdminHealthRecordPage, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.healthRecords(page), enabled: isAdmin })
}

export const useDeleteAdminHealthRecord = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdminHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.healthRecords._def })
      queryClient.invalidateQueries({ queryKey: healthQueries._def })
    },
  })
}

export const useAdminNotifications = (page = 0): UseQueryResult<AdminNotificationPage, Error> => {
  const isAdmin = useIsAdmin()
  return useQuery({ ...adminQueries.notifications(page), enabled: isAdmin })
}

export const useCreateAdminNotification = (): UseMutationResult<
  AdminNotification,
  Error,
  AdminNotificationCreateBody
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postAdminNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.notifications._def })
    },
  })
}

export const useDeleteAdminNotification = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdminNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.notifications._def })
    },
  })
}

/**
 * 공공데이터 동기화.
 * 외부 API 를 순회해 수 분이 걸릴 수 있으므로 재시도하지 않는다
 * (같은 동기화가 중복으로 도는 편이 실패보다 나쁘다).
 */
export const useSyncPublicData = (): UseMutationResult<SyncResult, Error, SyncTarget> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postPublicDataSync,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.dashboard().queryKey })
    },
  })
}

export const useResolveReport = (): UseMutationResult<
  void,
  Error,
  { reportId: number; status: ReportStatus; note?: string }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, status, note }) => patchReportStatus(reportId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueries.reports._def })
      // 처리 결과에 따라 게시글이 숨겨지므로 커뮤니티 목록도 다시 받는다.
      queryClient.invalidateQueries({ queryKey: communityQueries._def })
    },
  })
}
