'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import {
  useAdminNotifications,
  useCreateAdminNotification,
  useDeleteAdminNotification,
} from '@/queries/admin'
import {
  AdminNotification,
  AdminNotificationCreateBody,
  NOTIFICATION_TYPE_LABEL,
  NotificationType,
} from '@/types/apis/admin'
import { formatDate } from '@/utils/date'

interface SendFormValues {
  userId: string
  notificationType: NotificationType
  title: string
  message: string
}

const AdminNotificationsPage = (): ReactElement => {
  const [page, setPage] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminNotification | null>(null)

  const { data, isLoading, isError, refetch } = useAdminNotifications(page)
  const {
    mutate: createNotification,
    isPending: isCreatePending,
    isError: isCreateError,
  } = useCreateAdminNotification()
  const { mutate: deleteNotification, isPending: isDeletePending } = useDeleteAdminNotification()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SendFormValues>({
    mode: 'onChange',
    defaultValues: { userId: '', notificationType: 'SYSTEM', title: '', message: '' },
  })

  const notifications = data?.content ?? []

  const submit = (values: SendFormValues) => {
    const body: AdminNotificationCreateBody = {
      userId: Number(values.userId),
      notificationType: values.notificationType,
      title: values.title,
      message: values.message,
    }

    createNotification(body, {
      onSuccess: () => {
        setIsSending(false)
        reset()
      },
    })
  }

  if (isError) {
    return <ErrorView content="알림 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-c1-regular text-gray-600">
        특정 사용자에게 알림을 보냅니다. 전체 공지 기능은 아직 없어 한 명씩 발송해요.
      </p>

      <Button color="green" size="small" onClick={() => setIsSending(true)}>
        알림 발송
      </Button>

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !notifications.length ? (
        <EmptyState title="발송된 알림이 없어요" />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`총 ${data?.totalElements ?? notifications.length}건`}
          </p>

          <ul className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Chip color="blue">
                    {NOTIFICATION_TYPE_LABEL[notification.notificationType ?? ''] ??
                      notification.notificationType ??
                      '기타'}
                  </Chip>
                  {notification.isRead ? (
                    <Chip color="white">읽음</Chip>
                  ) : (
                    <Chip color="green">안 읽음</Chip>
                  )}
                  <span className="text-b1-semibold truncate text-gray-800">
                    {notification.title}
                  </span>
                </div>

                <p className="text-b2-regular line-clamp-2 text-gray-600">{notification.message}</p>
                <span className="text-c1-regular text-gray-500">
                  {`대상 ${notification.userId ?? '-'} · ${formatDate(notification.createdAt, 'MM.dd HH:mm')}`}
                </span>

                <Button
                  color="red"
                  size="small"
                  className="mt-1"
                  disabled={isDeletePending}
                  onClick={() => setDeleteTarget(notification)}
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>

          {!data?.last && (
            <Button color="gray" size="small" onClick={() => setPage((prev) => prev + 1)}>
              더 보기
            </Button>
          )}
        </>
      )}

      <Dialog.Root open={isSending} onOpenChange={(open) => !open && setIsSending(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-10 bg-black/65" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-20 max-h-[85dvh] w-[21rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-5">
            <Dialog.Title className="text-t1-semibold text-gray-800">알림 발송</Dialog.Title>
            <Dialog.Description className="text-b2-regular mt-1 mb-4 text-gray-600">
              보낸 알림은 사용자에게 바로 보입니다.
            </Dialog.Description>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)}>
              <Controller
                name="userId"
                control={control}
                rules={{
                  required: '사용자 ID를 입력해주세요',
                  pattern: { value: /^\d+$/, message: '숫자 ID 를 입력해주세요' },
                }}
                render={({ field }) => (
                  <Input
                    label="대상 사용자 ID"
                    required
                    type="number"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="사용자 관리 화면에서 확인한 숫자 ID"
                    errorText={errors.userId?.message}
                    showErrorText
                  />
                )}
              />

              <Controller
                name="notificationType"
                control={control}
                render={({ field }) => (
                  <fieldset className="flex flex-col gap-2">
                    <legend className="text-b1-semibold text-gray-800">유형</legend>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(Object.keys(NOTIFICATION_TYPE_LABEL) as NotificationType[]).map((type) => (
                        <ToggleChip
                          key={type}
                          pressed={field.value === type}
                          onPressedChange={() => field.onChange(type)}
                        >
                          {NOTIFICATION_TYPE_LABEL[type]}
                        </ToggleChip>
                      ))}
                    </div>
                  </fieldset>
                )}
              />

              <Controller
                name="title"
                control={control}
                rules={{ required: '제목을 입력해주세요' }}
                render={({ field }) => (
                  <Input
                    label="제목"
                    required
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    errorText={errors.title?.message}
                    showErrorText
                  />
                )}
              />

              <Controller
                name="message"
                control={control}
                rules={{ required: '내용을 입력해주세요' }}
                render={({ field }) => (
                  <Input
                    label="내용"
                    required
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    errorText={errors.message?.message}
                    showErrorText
                  />
                )}
              />

              {isCreateError && (
                <p className="text-red text-b2-regular" role="alert">
                  발송에 실패했어요. 사용자 ID 를 다시 확인해주세요.
                </p>
              )}

              <div className="flex gap-2">
                <Button type="button" color="gray" size="small" onClick={() => setIsSending(false)}>
                  취소
                </Button>
                <Button
                  type="submit"
                  color="green"
                  size="small"
                  disabled={!isValid || isCreatePending}
                >
                  {isCreatePending ? '발송 중...' : '발송'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog
        title="알림을 삭제할까요?"
        description="사용자의 알림함에서도 사라집니다."
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setDeleteTarget(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color="red"
            size="small"
            disabled={isDeletePending}
            onClick={() =>
              deleteTarget &&
              deleteNotification(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
            }
          >
            삭제
          </Button>
        }
      />
    </div>
  )
}

export default AdminNotificationsPage
