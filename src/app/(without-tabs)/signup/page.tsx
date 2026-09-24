'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { getErrorMessage } from '@/apis/errors'

import Button from '@/components/common/Button'
import Layout from '@/components/common/Layout'
import Input from '@/components/common/input'
import { usePostKakaoCompleteRegistration } from '@/queries/auth'
import { KakaoRegistrationRequest, kakaoRegistrationRequestSchema } from '@/types/apis/auth'
import { zodResolver } from '@/utils/zodResolver'

const SignUpPage = (): ReactElement => {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<KakaoRegistrationRequest>({
    mode: 'onChange',
    // 검증 규칙은 서버로 보내는 스키마 하나에서만 온다.
    resolver: zodResolver<KakaoRegistrationRequest>(kakaoRegistrationRequestSchema),
    defaultValues: {
      name: '',
      role: 'PARENT',
    },
  })

  const signupMutation = usePostKakaoCompleteRegistration()

  const onSubmit = (data: KakaoRegistrationRequest) => {
    signupMutation.mutate(data, {
      onSuccess: () => router.replace('/home'),
      // 실패를 삼키면 사용자는 버튼이 먹통이 된 것으로 본다. 아래에 메시지를 띄운다.
      onError: (error) => console.error('회원가입 실패:', error),
    })
  }

  return (
    <Layout title="회원가입" hasTopNav hasBackButton contentClassName="px-6 py-5">
      <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col">
        <div className="flex grow flex-col overflow-y-scroll">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-h3-bold whitespace-pre-wrap text-black">
                {
                  '맘편한에 오신 걸 환영해요 :)\n함께하는 육아,\n이제 조금 더 편안하게 시작해볼까요?'
                }
              </span>
              <span className="text-t2-regular text-gray-800">
                회원가입을 위한 정보를 입력해주세요.
              </span>
            </div>

            {/* 닉네임 */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="닉네임"
                  placeholder="닉네임을 입력해주세요 (2-10글자)"
                  required
                  minLength={2}
                  maxLength={10}
                  errorText={errors.name?.message}
                  showErrorText={!!errors.name}
                />
              )}
            />
          </div>
        </div>
        {signupMutation.isError && (
          <p className="text-red text-b2-regular pb-3" role="alert">
            {getErrorMessage(
              signupMutation.error,
              '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.',
            )}
          </p>
        )}
        <Button type="submit" color="green" disabled={!isValid || signupMutation.isPending}>
          {signupMutation.isPending ? '회원가입 중...' : '회원가입 하기'}
        </Button>
      </form>
    </Layout>
  )
}

export default SignUpPage
