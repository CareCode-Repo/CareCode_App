'use client'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { getErrorMessage } from '@/apis/errors'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import { useChildDetail, useUpdateChild } from '@/queries/child'
import { ChildBody } from '@/types/apis/child'

const GENDER_OPTIONS = [
  { value: 'MALE', label: '남아' },
  { value: 'FEMALE', label: '여아' },
]

const EditChildContent = ({ childId }: { childId: number }): ReactElement => {
  const router = useRouter()
  const { data: child, isLoading, isError, refetch } = useChildDetail(childId)
  const { mutate: updateChild, isPending, isError: isSaveError, error } = useUpdateChild(childId)
  const today = new Date().toISOString().slice(0, 10)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChildBody>({
    mode: 'onChange',
    defaultValues: { name: '', birthDate: '', gender: undefined, specialNeeds: '' },
  })

  // 서버 값이 도착하면 폼을 채운다. 빈 폼으로 저장하면 기존 정보를 지우게 된다.
  useEffect(() => {
    if (!child) return
    reset({
      name: child.name ?? '',
      birthDate: child.birthDate ?? '',
      gender: child.gender ?? undefined,
      specialNeeds: child.specialNeeds ?? '',
    })
  }, [child, reset])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorView content="아이 정보를 불러오지 못했어요." onRetry={() => refetch()} />
  }

  const onSubmit = (values: ChildBody) => {
    updateChild(values, { onSuccess: () => router.replace(`/children/${childId}`) })
  }

  return (
    <form className="flex grow flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        rules={{
          required: '아이 이름을 입력해주세요',
          maxLength: { value: 100, message: '이름은 100자를 넘을 수 없습니다' },
        }}
        render={({ field }) => (
          <Input
            label="이름"
            required
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder="아이 이름을 입력해주세요"
            maxLength={100}
            errorText={errors.name?.message}
            showErrorText
          />
        )}
      />

      <Controller
        name="birthDate"
        control={control}
        rules={{
          required: '생년월일을 선택해주세요',
          validate: (value) => value <= today || '생년월일은 오늘 이전이어야 합니다',
        }}
        render={({ field }) => (
          <Input
            label="생년월일"
            required
            type="date"
            value={field.value ?? ''}
            onChange={field.onChange}
            max={today}
            errorText={errors.birthDate?.message}
            showErrorText
          />
        )}
      />
      <p className="text-c1-regular -mt-3 text-gray-600">
        생년월일을 고치면 예방접종 예정일도 함께 다시 계산돼요.
      </p>

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-b1-semibold text-gray-800">성별</legend>
            <div className="flex gap-2.5 pt-2">
              {GENDER_OPTIONS.map((option) => (
                <ToggleChip
                  key={option.value}
                  pressed={field.value === option.value}
                  onPressedChange={(pressed) => field.onChange(pressed ? option.value : undefined)}
                >
                  {option.label}
                </ToggleChip>
              ))}
            </div>
            <p className="text-c1-regular text-gray-600">
              성별을 입력하면 WHO 기준 성장 백분위를 함께 볼 수 있어요.
            </p>
          </fieldset>
        )}
      />

      <Controller
        name="specialNeeds"
        control={control}
        rules={{ maxLength: { value: 500, message: '특이사항은 500자를 넘을 수 없습니다' } }}
        render={({ field }) => (
          <Input
            label="특이사항"
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder="알레르기, 기저질환 등 (선택)"
            maxLength={500}
            errorText={errors.specialNeeds?.message}
            showErrorText
          />
        )}
      />

      {isSaveError && (
        <p className="text-red text-b1-regular" role="alert">
          {getErrorMessage(error, '저장하지 못했어요. 잠시 후 다시 시도해주세요.')}
        </p>
      )}

      <div className="mt-auto pt-5">
        <Button type="submit" color="green" disabled={!isValid || isPending}>
          {isPending ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </form>
  )
}

const EditChildPage = (): ReactElement => {
  const params = useParams()
  const childId = Number(params.childId)

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="아이 정보 수정" contentClassName="px-4.5 py-5">
        <EditChildContent childId={childId} />
      </Layout>
    </AuthGuard>
  )
}

export default EditChildPage
