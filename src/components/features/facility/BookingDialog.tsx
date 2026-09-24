'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Button from '@/components/common/Button'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import { useMyChildren } from '@/queries/child'
import { BOOKING_TYPE_LABEL, BookingType, PostFacilityBookBody } from '@/types/apis/facility'
import { getChildAgeYears } from '@/utils/date'

interface BookingDialogProps {
  isOpen: boolean
  facilityName: string
  isPending?: boolean
  errorMessage?: string
  onClose: () => void
  onSubmit: (body: PostFacilityBookBody) => void
}

/** date-time-local 값(yyyy-MM-ddTHH:mm)을 서버 LocalDateTime 형식으로 맞춘다. */
const toLocalDateTime = (value: string): string => (value.length === 16 ? `${value}:00` : value)

/**
 * 방문 상담은 1시간으로 잡는다. 서버는 종료 시각이 필수(겹침 계산에 쓴다)인데 폼에는 종료 입력이 없어,
 * 예약이 "예약 시작/종료 시간은 필수입니다" 로 항상 실패했다.
 */
const DEFAULT_VISIT_MINUTES = 60

/** 시간대 없는 LocalDateTime 문자열에 분을 더한다. 브라우저 로컬 시각 기준으로 계산하고 그대로 돌려준다. */
const addMinutes = (localDateTime: string, minutes: number): string => {
  const date = new Date(localDateTime)
  date.setMinutes(date.getMinutes() + minutes)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  )
}

const BookingDialog = ({
  isOpen,
  facilityName,
  isPending = false,
  errorMessage,
  onClose,
  onSubmit,
}: BookingDialogProps): ReactElement => {
  const { data: children = [] } = useMyChildren()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PostFacilityBookBody>({
    mode: 'onChange',
    defaultValues: {
      childName: '',
      childAge: 0,
      parentName: '',
      parentPhone: '',
      bookingType: 'VISIT',
      startTime: '',
    },
  })

  const submit = (values: PostFacilityBookBody) => {
    const startTime = toLocalDateTime(values.startTime)
    onSubmit({
      ...values,
      childAge: Number(values.childAge),
      startTime,
      endTime: values.endTime
        ? toLocalDateTime(values.endTime)
        : addMinutes(startTime, DEFAULT_VISIT_MINUTES),
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/65" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-20 max-h-[85dvh] w-[21rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-5">
          <Dialog.Title className="text-t1-semibold text-gray-800">방문 예약</Dialog.Title>
          <Dialog.Description className="text-b2-regular mt-1 mb-4 text-gray-600">
            {facilityName}
          </Dialog.Description>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)}>
            {/* 등록해 둔 아이가 있으면 한 번에 채운다 */}
            {children.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <ToggleChip
                    key={child.id}
                    pressed={false}
                    onPressedChange={() => {
                      setValue('childName', child.name, { shouldValidate: true })
                      setValue('childAge', getChildAgeYears(child.birthDate) ?? 0, {
                        shouldValidate: true,
                      })
                    }}
                  >
                    {`${child.name} 정보 채우기`}
                  </ToggleChip>
                ))}
              </div>
            )}

            <Controller
              name="childName"
              control={control}
              rules={{ required: '아이 이름을 입력해주세요' }}
              render={({ field }) => (
                <Input
                  label="아이 이름"
                  required
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  errorText={errors.childName?.message}
                  showErrorText
                />
              )}
            />

            <Controller
              name="childAge"
              control={control}
              rules={{
                required: '아이 나이를 입력해주세요',
                min: { value: 0, message: '0 이상으로 입력해주세요' },
                max: { value: 19, message: '19 이하로 입력해주세요' },
              }}
              render={({ field }) => (
                <Input
                  label="아이 나이 (만)"
                  required
                  type="number"
                  value={String(field.value ?? '')}
                  onChange={(value) => field.onChange(value === '' ? '' : Number(value))}
                  errorText={errors.childAge?.message}
                  showErrorText
                />
              )}
            />

            <Controller
              name="parentName"
              control={control}
              rules={{ required: '보호자 이름을 입력해주세요' }}
              render={({ field }) => (
                <Input
                  label="보호자 이름"
                  required
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  errorText={errors.parentName?.message}
                  showErrorText
                />
              )}
            />

            <Controller
              name="parentPhone"
              control={control}
              rules={{ required: '연락처를 입력해주세요' }}
              render={({ field }) => (
                <Input
                  label="연락처"
                  required
                  type="tel"
                  placeholder="010-0000-0000"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  errorText={errors.parentPhone?.message}
                  showErrorText
                />
              )}
            />

            <Controller
              name="bookingType"
              control={control}
              render={({ field }) => (
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-b1-semibold text-gray-800">예약 유형</legend>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(Object.keys(BOOKING_TYPE_LABEL) as BookingType[]).map((type) => (
                      <ToggleChip
                        key={type}
                        pressed={field.value === type}
                        onPressedChange={() => field.onChange(type)}
                      >
                        {BOOKING_TYPE_LABEL[type]}
                      </ToggleChip>
                    ))}
                  </div>
                </fieldset>
              )}
            />

            <Controller
              name="startTime"
              control={control}
              rules={{ required: '방문 일시를 선택해주세요' }}
              render={({ field }) => (
                <Input
                  label="방문 일시"
                  required
                  type="datetime-local"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  errorText={errors.startTime?.message}
                  showErrorText
                />
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input
                  label="요청사항"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="궁금한 점을 남겨주세요 (선택)"
                />
              )}
            />

            {errorMessage && (
              <p className="text-red text-b1-regular" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" color="gray" size="small" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" color="green" size="small" disabled={!isValid || isPending}>
                {isPending ? '신청 중...' : '예약 신청'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default BookingDialog
