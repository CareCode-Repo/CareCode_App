'use client'
import { ReactElement } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Button from '@/components/common/Button'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import { Child } from '@/types/apis/child'
import { CreateHealthRecordBody, RECORD_TYPE_LABEL, RecordType } from '@/types/apis/health'

export interface HealthRecordFormValues {
  childId: string
  recordType: RecordType
  title: string
  description?: string
  recordDate: string // yyyy-MM-ddTHH:mm
  nextDate?: string
  hospitalName?: string
  doctorName?: string
  height?: string
  weight?: string
  temperature?: string
}

interface HealthRecordFormProps {
  childOptions: Child[]
  defaultValues?: Partial<HealthRecordFormValues>
  /** 수정 화면에서는 아이/타입을 바꾸지 않는다 (서버 수정 API 가 받지 않음) */
  mode?: 'create' | 'edit'
  isPending?: boolean
  isError?: boolean
  submitLabel?: string
  onSubmit: (values: HealthRecordFormValues) => void
}

/** datetime-local 값을 서버 LocalDateTime 으로 맞춘다. */
export const toLocalDateTime = (value?: string): string | undefined => {
  if (!value) return undefined
  return value.length === 16 ? `${value}:00` : value
}

/** 폼 값을 생성 요청 body 로 변환한다. 빈 문자열은 스키마에서 undefined 로 정규화된다. */
export const toCreateBody = (values: HealthRecordFormValues): CreateHealthRecordBody => ({
  childId: values.childId,
  recordType: values.recordType,
  title: values.title,
  description: values.description || undefined,
  recordDate: toLocalDateTime(values.recordDate) as string,
  nextDate: toLocalDateTime(values.nextDate),
  hospitalName: values.hospitalName || undefined,
  doctorName: values.doctorName || undefined,
  height: values.height,
  weight: values.weight,
  temperature: values.temperature,
})

const HealthRecordForm = ({
  childOptions,
  defaultValues,
  mode = 'create',
  isPending = false,
  isError = false,
  submitLabel = '저장하기',
  onSubmit,
}: HealthRecordFormProps): ReactElement => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<HealthRecordFormValues>({
    mode: 'onChange',
    defaultValues: {
      childId: childOptions[0] ? String(childOptions[0].id) : '',
      recordType: 'CHECKUP',
      title: '',
      description: '',
      recordDate: new Date().toISOString().slice(0, 16),
      nextDate: '',
      hospitalName: '',
      doctorName: '',
      height: '',
      weight: '',
      temperature: '',
      ...defaultValues,
    },
  })

  return (
    <form className="flex grow flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      {mode === 'create' && (
        <>
          <Controller
            name="childId"
            control={control}
            rules={{ required: '아이를 선택해주세요' }}
            render={({ field }) => (
              <fieldset className="flex flex-col gap-2">
                <legend className="text-b1-semibold text-gray-800">아이</legend>
                <div className="flex flex-wrap gap-2 pt-2">
                  {childOptions.map((child) => (
                    <ToggleChip
                      key={child.id}
                      pressed={field.value === String(child.id)}
                      onPressedChange={() => field.onChange(String(child.id))}
                    >
                      {child.name}
                    </ToggleChip>
                  ))}
                </div>
                {errors.childId && (
                  <p className="text-red text-b2-regular" role="alert">
                    {errors.childId.message}
                  </p>
                )}
              </fieldset>
            )}
          />

          <Controller
            name="recordType"
            control={control}
            render={({ field }) => (
              <fieldset className="flex flex-col gap-2">
                <legend className="text-b1-semibold text-gray-800">기록 종류</legend>
                <div className="flex flex-wrap gap-2 pt-2">
                  {(Object.keys(RECORD_TYPE_LABEL) as RecordType[]).map((type) => (
                    <ToggleChip
                      key={type}
                      pressed={field.value === type}
                      onPressedChange={() => field.onChange(type)}
                    >
                      {RECORD_TYPE_LABEL[type]}
                    </ToggleChip>
                  ))}
                </div>
              </fieldset>
            )}
          />
        </>
      )}

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
            placeholder="예: 12개월 영유아 검진"
            errorText={errors.title?.message}
            showErrorText
          />
        )}
      />

      <Controller
        name="recordDate"
        control={control}
        rules={{ required: '기록 날짜를 선택해주세요' }}
        render={({ field }) => (
          <Input
            label="기록 일시"
            required
            type="datetime-local"
            value={field.value ?? ''}
            onChange={field.onChange}
            errorText={errors.recordDate?.message}
            showErrorText
          />
        )}
      />

      {/* 측정값 — 성장 곡선의 입력이 되는 항목 */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <legend className="text-b1-semibold px-1 text-gray-800">측정값 (선택)</legend>
        <p className="text-c1-regular text-gray-600">
          키·몸무게를 남기면 성장 곡선에서 WHO 기준 백분위와 함께 볼 수 있어요.
        </p>

        <div className="flex gap-3">
          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <Input
                label="키 (cm)"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="76.5"
              />
            )}
          />
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <Input
                label="몸무게 (kg)"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="9.8"
              />
            )}
          />
        </div>

        <Controller
          name="temperature"
          control={control}
          render={({ field }) => (
            <Input
              label="체온 (℃)"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="36.8"
            />
          )}
        />
      </fieldset>

      <Controller
        name="hospitalName"
        control={control}
        render={({ field }) => (
          <Input
            label="병원"
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder="방문한 병원 이름 (선택)"
          />
        )}
      />

      <Controller
        name="doctorName"
        control={control}
        render={({ field }) => (
          <Input
            label="담당의"
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder="선택"
          />
        )}
      />

      <Controller
        name="nextDate"
        control={control}
        render={({ field }) => (
          <Input
            label="다음 예정일"
            type="datetime-local"
            value={field.value ?? ''}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Input
            label="메모"
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder="증상, 처방 내용 등 (선택)"
          />
        )}
      />

      {isError && (
        <p className="text-red text-b1-regular" role="alert">
          저장에 실패했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}

      <div className="mt-auto pt-5">
        <Button type="submit" color="green" disabled={!isValid || isPending}>
          {isPending ? '저장 중...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default HealthRecordForm
