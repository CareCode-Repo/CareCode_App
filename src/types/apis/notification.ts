import { z } from 'zod'

export const NotificationType = ['POLICY', 'HEALTH', 'COMMUNITY', 'FACILITY', 'SYSTEM'] as const
export type NotificationType = (typeof NotificationType)[number]

export const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  POLICY: '정책',
  HEALTH: '건강',
  COMMUNITY: '커뮤니티',
  FACILITY: '시설',
  SYSTEM: '시스템',
}

/**
 * 서버 NotificationInfoResponse 대응.
 *
 * 서버가 보내는 이름은 `notificationType` 이다 (`type` 이 아니다).
 * 화면 이동에 쓸 수 있는 `actionUrl` 은 서버 응답에 없으므로 유형으로 목적지를 정한다.
 */
export const notificationSchema = z.object({
  id: z.number(),
  userId: z.string().nullish(),
  notificationType: z.string().nullish(),
  title: z.string().nullish(),
  message: z.string().nullish(),
  priority: z.string().nullish(),
  isRead: z.boolean().default(false),
  createdAt: z.string().nullish(),
  readAt: z.string().nullish(),
  scheduledAt: z.string().nullish(),
  sentAt: z.string().nullish(),
  deliveryStatus: z.string().nullish(),
})
export type Notification = z.infer<typeof notificationSchema>

// GET /notifications - 대상은 인증 주체로 결정되므로 파라미터가 없다
export const getNotificationsResponseSchema = z.array(notificationSchema)
export type GetNotificationsResponse = z.infer<typeof getNotificationsResponseSchema>

// GET /notifications/{notificationId}
// PUT /notifications/{notificationId}/read
export const putNotificationToReadPathSchema = z.object({
  notificationId: z.number(),
})
export type PutNotificationToReadPath = z.infer<typeof putNotificationToReadPathSchema>

/** 서버가 형식을 보장하지 않아 결과는 읽지 않는다. */
export const putNotificationToReadResponseSchema = z.unknown()
export type PutNotificationToReadResponse = z.infer<typeof putNotificationToReadResponseSchema>

/** 알림 채널. 서버가 `channel.toLowerCase()` 로 분기하므로 소문자로 보낸다. */
export const NOTIFICATION_CHANNEL = ['inapp', 'push', 'email', 'sms'] as const
export type NotificationChannel = (typeof NOTIFICATION_CHANNEL)[number]

export const NOTIFICATION_CHANNEL_LABEL: Record<NotificationChannel, string> = {
  inapp: '앱 알림함',
  push: '푸시 알림',
  email: '이메일',
  sms: '문자',
}

/**
 * 서버 NotificationSettingsResponse 대응. **알림 유형 하나당 한 행**이다.
 * (예전에는 `{ success, preferences: {...} }` 단일 객체로 잘못 모델링돼 있었다)
 */
export const notificationPreferenceSchema = z.object({
  id: z.number().nullish(),
  userId: z.string().nullish(),
  notificationType: z.string(),
  emailEnabled: z.boolean().nullish(),
  pushEnabled: z.boolean().nullish(),
  smsEnabled: z.boolean().nullish(),
  inAppEnabled: z.boolean().nullish(),
  emailAddress: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  deviceToken: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>

// GET /notifications/preferences - 한 번도 설정한 적 없으면 빈 배열이 온다
export const getNotificationPreferencesResponseSchema = z.array(notificationPreferenceSchema)
export type GetNotificationPreferencesResponse = z.infer<
  typeof getNotificationPreferencesResponseSchema
>

/**
 * 설정 행이 없는 유형에 보여줄 기본값.
 *
 * 서버가 행을 만들 때 쓰는 값과 같아야 한다. 다르면 사용자가 토글 하나를 건드리는 순간
 * (그때 행이 생기면서) 손대지 않은 다른 채널의 표시값이 바뀐다.
 */
export const DEFAULT_NOTIFICATION_CHANNELS: Record<NotificationChannel, boolean> = {
  inapp: true,
  push: true,
  email: false,
  sms: false,
}

export interface NotificationTypeSetting {
  notificationType: NotificationType
  channels: Record<NotificationChannel, boolean>
  /** 서버에 저장된 행이 있는지. 없으면 기본값을 보여주는 중이다. */
  isStored: boolean
}

/** 서버가 준 유형별 설정을 전체 유형 목록 위에 덮어 화면에 쓸 형태로 만든다. */
export const mergeNotificationPreferences = (
  preferences: NotificationPreference[],
): NotificationTypeSetting[] =>
  NotificationType.map((type) => {
    const stored = preferences.find((preference) => preference.notificationType === type)

    return {
      notificationType: type,
      isStored: !!stored,
      channels: {
        inapp: stored?.inAppEnabled ?? DEFAULT_NOTIFICATION_CHANNELS.inapp,
        push: stored?.pushEnabled ?? DEFAULT_NOTIFICATION_CHANNELS.push,
        email: stored?.emailEnabled ?? DEFAULT_NOTIFICATION_CHANNELS.email,
        sms: stored?.smsEnabled ?? DEFAULT_NOTIFICATION_CHANNELS.sms,
      },
    }
  })

/**
 * 서버 NotificationChannelStatusResponse 대응.
 *
 * 자격증명 미설정이나 사업자 미연동은 서버만 아는 사정이다. 이 값이 없으면 화면은
 * 켜도 아무것도 오지 않는 채널을 "켤 수 있다" 고 안내하게 된다.
 */
/**
 * 못 쓰는 이유의 종류.
 *
 * - `SERVER_NOT_CONFIGURED` — 서버 설정 문제. 사용자가 할 수 있는 일이 없다.
 * - `NO_DESTINATION` — 보낼 곳이 없다. 사용자가 등록하면 해결된다.
 *
 * 문구(`unavailableReason`)는 바뀔 수 있으므로 문자열로 판단하지 않는다.
 */
export const CHANNEL_REASON_CODE = ['SERVER_NOT_CONFIGURED', 'NO_DESTINATION'] as const
export type ChannelReasonCode = (typeof CHANNEL_REASON_CODE)[number]

export const notificationChannelStatusSchema = z.object({
  channel: z.string(),
  displayName: z.string().nullish(),
  available: z.boolean(),
  unavailableReason: z.string().nullish(),
  reasonCode: z.string().nullish(),
})
export type NotificationChannelStatus = z.infer<typeof notificationChannelStatusSchema>

// GET /notifications/channels
export const getNotificationChannelsResponseSchema = z.array(notificationChannelStatusSchema)
export type GetNotificationChannelsResponse = z.infer<typeof getNotificationChannelsResponseSchema>

export interface ChannelAvailability {
  isAvailable: boolean
  unavailableReason?: string
  reasonCode?: string
  /** 사용자가 직접 해결할 수 있는 문제인지. 서버 설정 문제라면 안내해봐야 소용없다. */
  isFixableByUser: boolean
}

/**
 * 채널별 사용 가능 여부를 찾아보기 좋은 형태로 만든다.
 *
 * 서버가 알려주지 않은 채널은 **사용 가능**으로 본다. 상태 조회가 실패했다고 토글을 잠그면
 * 멀쩡한 설정까지 못 바꾸게 되는데, 그건 이 기능이 없던 때보다 나쁘다.
 */
export const toChannelAvailability = (
  statuses: NotificationChannelStatus[],
): Record<NotificationChannel, ChannelAvailability> =>
  NOTIFICATION_CHANNEL.reduce(
    (acc, channel) => {
      const status = statuses.find((item) => item.channel === channel)

      acc[channel] = {
        isAvailable: status?.available ?? true,
        unavailableReason: status?.unavailableReason ?? undefined,
        reasonCode: status?.reasonCode ?? undefined,
        isFixableByUser: status?.reasonCode === 'NO_DESTINATION',
      }
      return acc
    },
    {} as Record<NotificationChannel, ChannelAvailability>,
  )

// PUT /notifications/preferences/{notificationType}/channels/{channel}
export const putNotificationChannelBodySchema = z.object({
  notificationType: z.enum(NotificationType),
  channel: z.enum(NOTIFICATION_CHANNEL),
  enabled: z.boolean(),
})
export type PutNotificationChannelBody = z.infer<typeof putNotificationChannelBodySchema>

/**
 * 알림 유형별 이동 목적지.
 * 서버가 링크를 주지 않으므로 유형으로 정한다. 모르는 유형은 알림함에 머문다.
 */
export const NOTIFICATION_TARGET: Record<string, string> = {
  POLICY: '/search',
  HEALTH: '/children',
  COMMUNITY: '/community',
  FACILITY: '/facility',
}
