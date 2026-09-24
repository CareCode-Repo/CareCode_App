'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Button from '@/components/common/Button'
import Switch from '@/components/common/Switch'
import Input from '@/components/common/input'
import { AdminPolicyBody, AdminPolicyDetail, AdminPolicyPatchBody } from '@/types/apis/admin'

/**
 * 폼이 다루는 항목만 담는다.
 *
 * 수정은 PATCH 라서 여기 없는 항목(policyType·priority·policyCategoryId 등)은
 * 서버가 알아서 유지한다. 예전처럼 값을 실어 나를 필요가 없다.
 */
export interface PolicyFormValues {
  policyCode: string
  title: string
  description?: string
  targetRegion?: string
  benefitAmount?: string
  targetAgeMin?: string
  targetAgeMax?: string
  applicationUrl?: string
  contactInfo?: string
  applicationStartDate?: string
  applicationEndDate?: string
  isActive: boolean
}

interface PolicyFormDialogProps {
  isOpen: boolean
  /** 수정 모드면 초깃값을 넣는다 */
  defaultValues?: Partial<PolicyFormValues>
  mode?: 'create' | 'edit'
  isPending?: boolean
  isError?: boolean
  onClose: () => void
  onSubmit: (values: PolicyFormValues) => void
}

const toNumber = (value?: string): number | undefined => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** 날짜(yyyy-MM-dd)만 남긴다. 서버가 LocalDate 로 받는다. */
const toDateInput = (value?: string | null): string => (value ? value.slice(0, 10) : '')

/** 조회 응답 → 폼 값 */
export const toFormValues = (policy: AdminPolicyDetail): PolicyFormValues => ({
  policyCode: policy.policyCode,
  title: policy.title,
  description: policy.description ?? '',
  targetRegion: policy.targetRegion ?? '',
  benefitAmount: policy.benefitAmount != null ? String(policy.benefitAmount) : '',
  targetAgeMin: policy.targetAgeMin != null ? String(policy.targetAgeMin) : '',
  targetAgeMax: policy.targetAgeMax != null ? String(policy.targetAgeMax) : '',
  applicationUrl: policy.applicationUrl ?? '',
  contactInfo: policy.contactInfo ?? '',
  applicationStartDate: toDateInput(policy.applicationStartDate),
  applicationEndDate: toDateInput(policy.applicationEndDate),
  isActive: policy.isActive ?? true,
})

/** 등록용. 전체 값을 새로 만든다. */
export const toPolicyBody = (values: PolicyFormValues): AdminPolicyBody => ({
  policyCode: values.policyCode,
  title: values.title,
  description: values.description || undefined,
  targetRegion: values.targetRegion || undefined,
  benefitAmount: toNumber(values.benefitAmount),
  targetAgeMin: toNumber(values.targetAgeMin),
  targetAgeMax: toNumber(values.targetAgeMax),
  applicationUrl: values.applicationUrl || undefined,
  contactInfo: values.contactInfo || undefined,
  applicationStartDate: values.applicationStartDate || undefined,
  applicationEndDate: values.applicationEndDate || undefined,
  isActive: values.isActive,
})

/**
 * 수정용. 폼이 다루는 항목만 키로 넣는다.
 *
 * 입력을 비운 항목은 `undefined`(=키 없음)가 아니라 **`null`** 로 보내야 실제로 지워진다.
 * 폼에 없는 항목은 키 자체가 없으므로 서버가 기존 값을 그대로 둔다.
 */
export const toPolicyPatchBody = (values: PolicyFormValues): AdminPolicyPatchBody => ({
  policyCode: values.policyCode,
  title: values.title,
  description: values.description || null,
  targetRegion: values.targetRegion || null,
  benefitAmount: toNumber(values.benefitAmount) ?? null,
  targetAgeMin: toNumber(values.targetAgeMin) ?? null,
  targetAgeMax: toNumber(values.targetAgeMax) ?? null,
  applicationUrl: values.applicationUrl || null,
  contactInfo: values.contactInfo || null,
  applicationStartDate: values.applicationStartDate || null,
  applicationEndDate: values.applicationEndDate || null,
  isActive: values.isActive,
})

const PolicyFormDialog = ({
  isOpen,
  defaultValues,
  mode = 'create',
  isPending = false,
  isError = false,
  onClose,
  onSubmit,
}: PolicyFormDialogProps): ReactElement => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PolicyFormValues>({
    mode: 'onChange',
    defaultValues: {
      policyCode: '',
      title: '',
      description: '',
      targetRegion: '',
      benefitAmount: '',
      targetAgeMin: '',
      targetAgeMax: '',
      applicationUrl: '',
      contactInfo: '',
      applicationStartDate: '',
      applicationEndDate: '',
      isActive: true,
      ...defaultValues,
    },
  })

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/65" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-20 max-h-[85dvh] w-[21rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-5">
          <Dialog.Title className="text-t1-semibold text-gray-800">
            {mode === 'create' ? '정책 등록' : '정책 수정'}
          </Dialog.Title>
          <Dialog.Description className="text-b2-regular mt-1 mb-4 text-gray-600">
            등록하면 사용자 화면의 목록·추천·지역 비교에 바로 반영돼요.
          </Dialog.Description>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="policyCode"
              control={control}
              rules={{
                required: '정책 코드를 입력해주세요',
                maxLength: { value: 50, message: '50자 이내' },
              }}
              render={({ field }) => (
                <Input
                  label="정책 코드"
                  required
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="예: FIRST_MEETING_2026"
                  errorText={errors.policyCode?.message}
                  showErrorText
                  // 코드가 바뀌면 다른 정책이 되므로 수정 시에는 잠근다.
                  readOnly={mode === 'edit'}
                />
              )}
            />

            <Controller
              name="title"
              control={control}
              rules={{
                required: '정책명을 입력해주세요',
                maxLength: { value: 200, message: '200자 이내' },
              }}
              render={({ field }) => (
                <Input
                  label="정책명"
                  required
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  errorText={errors.title?.message}
                  showErrorText
                />
              )}
            />

            <Controller
              name="benefitAmount"
              control={control}
              render={({ field }) => (
                <Input
                  label="지원 금액 (원)"
                  type="number"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="비워두면 금액 미상으로 표시돼요"
                />
              )}
            />

            <Controller
              name="targetRegion"
              control={control}
              render={({ field }) => (
                <Input
                  label="대상 지역"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="비워두면 전국"
                />
              )}
            />

            <div className="flex gap-3">
              <Controller
                name="targetAgeMin"
                control={control}
                render={({ field }) => (
                  <Input
                    label="최소 월령"
                    type="number"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="targetAgeMax"
                control={control}
                render={({ field }) => (
                  <Input
                    label="최대 월령"
                    type="number"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <Controller
              name="applicationUrl"
              control={control}
              render={({ field }) => (
                <Input
                  label="신청 링크"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="https://"
                />
              )}
            />

            <div className="flex gap-3">
              <Controller
                name="applicationStartDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="신청 시작"
                    type="date"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="applicationEndDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="신청 종료"
                    type="date"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  label="설명"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="지원 내용 (선택)"
                />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <span className="text-b1-semibold text-gray-800">노출</span>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="사용자 화면 노출"
                  />
                </div>
              )}
            />

            {isError && (
              <p className="text-red text-b2-regular" role="alert">
                저장에 실패했어요. 잠시 후 다시 시도해주세요.
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" color="gray" size="small" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" color="green" size="small" disabled={!isValid || isPending}>
                {isPending ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default PolicyFormDialog
