'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useRef, useState } from 'react'
import { ConsentRequiredError, parseConsentRequired } from '@/apis/errors'
import AuthGuard from '@/components/common/AuthGuard'
import ConsentRequiredDialog from '@/components/common/ConsentRequiredDialog'
import EmptyState from '@/components/common/EmptyState'
import Layout from '@/components/common/Layout'
import HealthRecordForm, {
  HealthRecordFormValues,
  toCreateBody,
} from '@/components/features/health/HealthRecordForm'
import { useMyChildren } from '@/queries/child'
import { useCreateHealthRecord } from '@/queries/health'

const NewHealthRecordPage = (): ReactElement => {
  const router = useRouter()
  const { data: children = [], isLoading } = useMyChildren()
  const { mutate: createRecord, isPending, isError } = useCreateHealthRecord()

  const [consentRequirement, setConsentRequirement] = useState<ConsentRequiredError | null>(null)
  // 동의를 받은 뒤 사용자가 다시 입력하지 않도록 마지막 제출 값을 들고 있는다.
  const lastValuesRef = useRef<HealthRecordFormValues | null>(null)

  const submit = (values: HealthRecordFormValues) => {
    lastValuesRef.current = values

    createRecord(toCreateBody(values), {
      onSuccess: (record) => router.replace(`/health/${record.id}`),
      onError: (error) => {
        // 건강정보는 민감정보라 별도 동의가 없으면 서버가 403 으로 막는다.
        const requirement = parseConsentRequired(error)
        if (requirement) setConsentRequirement(requirement)
      },
    })
  }

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="건강 기록 추가" contentClassName="px-4.5 py-5">
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        ) : !children.length ? (
          <EmptyState
            title="먼저 아이를 등록해주세요"
            description="건강 기록은 아이별로 저장돼요."
            actionLabel="아이 등록하기"
            onAction={() => router.replace('/children/new')}
          />
        ) : (
          <HealthRecordForm
            childOptions={children}
            isPending={isPending}
            // 동의 안내를 띄우는 중이라면 일반 오류 문구는 감춘다.
            isError={isError && !consentRequirement}
            submitLabel="기록 저장"
            onSubmit={submit}
          />
        )}

        <ConsentRequiredDialog
          requirement={consentRequirement}
          onClose={() => setConsentRequirement(null)}
          onGranted={() => {
            if (lastValuesRef.current) submit(lastValuesRef.current)
          }}
        />
      </Layout>
    </AuthGuard>
  )
}

export default NewHealthRecordPage
