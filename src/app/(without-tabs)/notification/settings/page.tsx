'use client'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Separator from '@/components/common/Separator'
import Switch from '@/components/common/Switch'
import {
  useDisableAllNotifications,
  useNotificationChannels,
  useNotificationPreferences,
  useRegisterPushDevice,
  useResetNotificationPreferences,
  useUpdateNotificationChannel,
} from '@/queries/notification'
import {
  mergeNotificationPreferences,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_CHANNEL_LABEL,
  NOTIFICATION_TYPE_LABEL,
  NotificationChannel,
  NotificationType,
  toChannelAvailability,
} from '@/types/apis/notification'

/** 유형별로 무엇을 알려주는지. 토글만 있으면 무엇을 끄는 건지 알기 어렵다. */
const NOTIFICATION_TYPE_DESCRIPTION: Record<NotificationType, string> = {
  POLICY: '받을 수 있는 지원금과 마감 안내',
  HEALTH: '예방접종 일정과 건강검진 안내',
  COMMUNITY: '내 글의 댓글과 답글',
  FACILITY: '대기 중인 시설의 자리 알림',
  SYSTEM: '서비스 점검과 약관 변경 안내',
}

const NotificationSettingsPage = (): ReactElement => {
  const [resetOpen, setResetOpen] = useState(false)
  const [disableAllOpen, setDisableAllOpen] = useState(false)

  const { data: preferences = [], isLoading, isError, refetch } = useNotificationPreferences()
  const {
    mutate: updateChannel,
    isPending,
    variables,
    isError: isUpdateError,
  } = useUpdateNotificationChannel()
  const { mutate: disableAll, isPending: isDisablingAll } = useDisableAllNotifications()
  const { mutate: resetPreferences, isPending: isResetting } = useResetNotificationPreferences()
  const { data: channelStatuses = [] } = useNotificationChannels()
  const {
    mutate: registerDevice,
    isPending: isRegisteringDevice,
    isError: isRegisterError,
    error: registerError,
  } = useRegisterPushDevice()

  const settings = mergeNotificationPreferences(preferences)
  const availability = toChannelAvailability(channelStatuses)
  const isBusy = isPending || isDisablingAll || isResetting

  /** 저장 중인 토글만 잠근다. 전체를 잠그면 연달아 끄기가 번거롭다. */
  const isSaving = (notificationType: NotificationType, channel: NotificationChannel): boolean =>
    isPending && variables?.notificationType === notificationType && variables?.channel === channel

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="알림 설정" contentClassName="py-5">
        {isLoading ? (
          <ul className="flex flex-col gap-4 px-4.5">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </ul>
        ) : isError ? (
          <ErrorView content="알림 설정을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : (
          <>
            <p className="text-b2-regular px-4.5 pb-4 text-gray-600">
              알림 종류와 받을 방법을 각각 정할 수 있어요.
            </p>

            {isUpdateError && (
              <p className="text-red text-b2-regular px-4.5 pb-3" role="alert">
                설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.
              </p>
            )}

            {/*
              기기 등록은 유형별이 아니라 기기 단위라 한 번만 안내한다.
              서버 설정 문제로 푸시가 막힌 경우에는 등록해도 소용없으므로 띄우지 않는다.
            */}
            {availability.push.isFixableByUser && (
              <div className="mx-4.5 mb-5 rounded-lg bg-green-50 p-4">
                <p className="text-b2-semibold text-gray-800">이 기기에서 푸시 받기</p>
                <p className="text-c1-regular pt-1 pb-3 text-gray-600">
                  {availability.push.unavailableReason}
                </p>
                <Button
                  color="green"
                  size="small"
                  disabled={isRegisteringDevice}
                  onClick={() => registerDevice()}
                >
                  {isRegisteringDevice ? '등록 중...' : '알림 허용하기'}
                </Button>
                {isRegisterError && (
                  <p className="text-red text-c1-regular pt-2" role="alert">
                    {registerError?.message ?? '기기를 등록하지 못했어요.'}
                  </p>
                )}
              </div>
            )}

            {settings.map((setting) => (
              <section key={setting.notificationType} className="px-4.5 pb-5">
                <h2 className="text-b1-semibold text-gray-800">
                  {NOTIFICATION_TYPE_LABEL[setting.notificationType]}
                </h2>
                <p className="text-c1-regular pt-1 pb-3 text-gray-600">
                  {NOTIFICATION_TYPE_DESCRIPTION[setting.notificationType]}
                </p>

                <ul className="flex flex-col gap-3">
                  {NOTIFICATION_CHANNEL.map((channel) => {
                    const label = `${NOTIFICATION_TYPE_LABEL[setting.notificationType]} ${NOTIFICATION_CHANNEL_LABEL[channel]}`
                    const { isAvailable, unavailableReason } = availability[channel]

                    return (
                      <li key={channel} className="flex items-start justify-between gap-3">
                        <span className="flex flex-col">
                          <span
                            className={`text-b2-regular ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}
                          >
                            {NOTIFICATION_CHANNEL_LABEL[channel]}
                          </span>
                          {/* 왜 켤 수 없는지 밝히지 않으면 고장으로 보인다. */}
                          {!isAvailable && unavailableReason && (
                            <span className="text-c1-regular pt-0.5 text-gray-400">
                              {unavailableReason}
                            </span>
                          )}
                        </span>
                        <Switch
                          aria-label={label}
                          // 못 쓰는 채널은 서버에 켜져 있더라도 꺼진 것으로 보여준다.
                          // 켜졌다고 표시하면 오지 않는 알림을 기다리게 된다.
                          checked={isAvailable && setting.channels[channel]}
                          disabled={isBusy || !isAvailable}
                          onCheckedChange={(enabled) =>
                            updateChannel({
                              notificationType: setting.notificationType,
                              channel,
                              enabled,
                            })
                          }
                          className={
                            isSaving(setting.notificationType, channel) ? 'opacity-50' : ''
                          }
                        />
                      </li>
                    )
                  })}
                </ul>

                <Separator className="mt-5" />
              </section>
            ))}

            {/* 쓸 수 없는 채널을 안내해봐야 혼란만 준다. 실제로 쓸 수 있을 때만 알린다. */}
            {(availability.email.isAvailable || availability.sms.isAvailable) && (
              <p className="text-c1-regular px-4.5 pb-4 text-gray-600">
                {availability.email.isAvailable && availability.sms.isAvailable
                  ? '이메일과 문자는 계정에 등록된 연락처로 발송돼요.'
                  : availability.email.isAvailable
                    ? '이메일은 계정에 등록된 주소로 발송돼요.'
                    : '문자는 계정에 등록된 번호로 발송돼요.'}
              </p>
            )}

            <div className="flex gap-2 px-4.5">
              <Button
                color="gray"
                size="small"
                onClick={() => setResetOpen(true)}
                disabled={isBusy}
              >
                기본값으로 되돌리기
              </Button>
              <Button
                color="red"
                size="small"
                onClick={() => setDisableAllOpen(true)}
                disabled={isBusy}
              >
                모든 알림 끄기
              </Button>
            </div>
          </>
        )}

        <AlertDialog
          title="기본값으로 되돌릴까요?"
          description="모든 알림이 앱 알림함과 푸시만 켜진 상태로 돌아가요."
          isOpen={resetOpen}
          onClose={() => setResetOpen(false)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setResetOpen(false)}>
              취소
            </Button>
          }
          confirmButton={
            <Button
              color="green"
              size="small"
              disabled={isResetting}
              onClick={() => resetPreferences(undefined, { onSettled: () => setResetOpen(false) })}
            >
              되돌리기
            </Button>
          }
        />

        <AlertDialog
          title="모든 알림을 끌까요?"
          description="지원금 마감이나 예방접종 일정도 더 이상 알려드리지 못해요."
          isOpen={disableAllOpen}
          onClose={() => setDisableAllOpen(false)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setDisableAllOpen(false)}>
              취소
            </Button>
          }
          confirmButton={
            <Button
              color="red"
              size="small"
              disabled={isDisablingAll}
              onClick={() => disableAll(undefined, { onSettled: () => setDisableAllOpen(false) })}
            >
              모두 끄기
            </Button>
          }
        />
      </Layout>
    </AuthGuard>
  )
}

export default NotificationSettingsPage
