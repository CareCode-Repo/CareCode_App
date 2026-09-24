import { getAccessToken, getUserId } from '@/apis/auth'
import { CareCode } from '@/apis/interceptor'
import {
  GetNotificationChannelsResponse,
  getNotificationChannelsResponseSchema,
  GetNotificationPreferencesResponse,
  getNotificationPreferencesResponseSchema,
  GetNotificationsResponse,
  getNotificationsResponseSchema,
  NotificationPreference,
  notificationPreferenceSchema,
  PutNotificationChannelBody,
  putNotificationChannelBodySchema,
  PutNotificationToReadPath,
  putNotificationToReadPathSchema,
} from '@/types/apis/notification'

// GET /notifications - 대상은 인증 주체로 결정된다
export const getNotificationList = async (): Promise<GetNotificationsResponse> => {
  const res = await CareCode.get('/notifications')
  return getNotificationsResponseSchema.parse(res.data)
}

export const putNotificationToRead = async (path: PutNotificationToReadPath): Promise<void> => {
  const parsedPath = putNotificationToReadPathSchema.parse(path)
  await CareCode.put(`/notifications/${parsedPath.notificationId}/read`)
}

// DELETE /notifications/{notificationId}
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await CareCode.delete(`/notifications/${notificationId}`)
}

// PUT /notifications/read-all
export const putAllNotificationsToRead = async (): Promise<void> => {
  await CareCode.put('/notifications/read-all')
}

// GET /notifications/unread - 헤더 배지용
export const getUnreadNotifications = async (): Promise<GetNotificationsResponse> => {
  const res = await CareCode.get('/notifications/unread')
  // 서버가 배열 또는 페이지 형태 중 어느 쪽으로 주더라도 목록만 뽑아낸다.
  const list = Array.isArray(res.data) ? res.data : (res.data?.content ?? [])
  return getNotificationsResponseSchema.parse(list)
}

export const getNotificationPreferences = async (): Promise<GetNotificationPreferencesResponse> => {
  const res = await CareCode.get('/notifications/preferences')
  return getNotificationPreferencesResponseSchema.parse(res.data)
}

// GET /notifications/channels - 어떤 채널을 실제로 쓸 수 있는지
export const getNotificationChannels = async (): Promise<GetNotificationChannelsResponse> => {
  const res = await CareCode.get('/notifications/channels')
  return getNotificationChannelsResponseSchema.parse(res.data)
}

/**
 * 알림 설정 쓰기 엔드포인트가 요구하는 `userId` 파라미터.
 *
 * 서버는 이 값이 인증 주체와 같은지 확인하고 다르면 거절한다. 실제 대상은 토큰에서 정하므로
 * 값 자체는 로그인할 때 저장해 둔 것을 그대로 보낸다.
 */
const requireUserId = (): string => {
  const userId = getUserId()
  if (!userId) throw new Error('로그인이 필요합니다.')

  return userId
}

/**
 * 채널별 알림 설정 변경.
 *
 * 설정 객체 전체를 보내는 `PUT /notifications/preferences` 대신 이 엔드포인트를 쓴다. 그쪽은
 * 응답 DTO 를 그대로 본문으로 받아 화면에 없는 값(emailAddress, deviceToken 등)까지 덮어쓰는데,
 * 이쪽은 한 번에 한 채널만 바꾸므로 건드리지 않은 값이 지워질 일이 없다.
 */
export const putNotificationChannel = async (
  body: PutNotificationChannelBody,
): Promise<NotificationPreference> => {
  const parsed = putNotificationChannelBodySchema.parse(body)
  const res = await CareCode.put(
    `/notifications/preferences/${parsed.notificationType}/channels/${parsed.channel}`,
    null,
    { params: { userId: requireUserId(), enabled: parsed.enabled } },
  )

  return notificationPreferenceSchema.parse(res.data)
}

/**
 * 이 기기의 푸시 토큰 등록.
 *
 * 등록하지 않으면 서버가 보낼 곳을 몰라 푸시가 나가지 않는다. 채널 상태 조회가
 * "등록된 기기가 없다" 고 답하는 것도 이 값이 없기 때문이다.
 */
export const postPushToken = async (pushToken: string): Promise<void> => {
  const userId = requireUserId()

  await CareCode.post(
    '/notifications/push-token',
    { userId, pushToken, deviceType: 'WEB' },
    { params: { userId } },
  )
}

// PUT /notifications/preferences/disable-all
export const putDisableAllNotifications = async (): Promise<void> => {
  await CareCode.put('/notifications/preferences/disable-all', null, {
    params: { userId: requireUserId() },
  })
}

// PUT /notifications/preferences/reset - 모든 유형을 기본값(앱 알림함·푸시만)으로 되돌린다
export const putResetNotificationPreferences = async (): Promise<void> => {
  await CareCode.put('/notifications/preferences/reset', null, {
    params: { userId: requireUserId() },
  })
}

/**
 * 알림 열람 집계.
 *
 * 서버는 클릭을 기록하고 읽음 처리한 뒤 딥링크(`carecode://`)로 302 를 준다. 모바일 앱을 위한
 * 설계라 웹에서 리다이렉트를 따라가면 실패한다. 그래서 axios 대신 fetch 를 쓰고
 * `redirect: 'manual'` 로 응답을 무시한다 — 요청 자체는 전달되므로 집계와 읽음 처리는 이뤄지고,
 * 화면 이동은 앱 내부에서 우리가 한다.
 *
 * 집계 실패가 사용자의 화면 이동을 막아서는 안 되므로 오류는 삼킨다.
 */
export const trackNotificationOpen = async (notificationId: number): Promise<void> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  const token = getAccessToken()

  try {
    await fetch(`${baseUrl}/notifications/${notificationId}/open`, {
      method: 'GET',
      redirect: 'manual',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    // 집계는 부가 기능이다. 실패해도 조용히 넘어간다.
  }
}
