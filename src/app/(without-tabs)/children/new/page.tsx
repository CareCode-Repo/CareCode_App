'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import { Controller, useForm } from 'react-hook-form'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import Layout from '@/components/common/Layout'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import { useCreateChild } from '@/queries/child'
import { ChildBody } from '@/types/apis/child'

const GENDER_OPTIONS = [
  { value: 'MALE', label: '남아' },
  { value: 'FEMALE', label: '여아' },
]

const NewChildPage = (): ReactElement => {
  const router = useRouter()
  const { mutate: createChild, isPending, isError } = useCreateChild()
  const today = new Date().toISOString().slice(0, 10)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChildBody>({
    mode: 'onChange',
    defaultValues: { name: '', birthDate: '', gender: undefined, specialNeeds: '' },
  })

  const onSubmit = (values: ChildBody) => {
    createChild(values, {
      onSuccess: (child) => router.replace(`/children/${child.id}`),
    })
  }

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="아이 등록" contentClassName="px-4.5 py-5">
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
                      onPressedChange={(pressed) =>
                        field.onChange(pressed ? option.value : undefined)
                      }
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

          {isError && (
            <p className="text-red text-b1-regular" role="alert">
              등록에 실패했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}

          <div className="mt-auto pt-5">
            <Button type="submit" color="green" disabled={!isValid || isPending}>
              {isPending ? '등록 중...' : '등록하기'}
            </Button>
          </div>
        </form>
      </Layout>
    </AuthGuard>
  )
}

export default NewChildPage
