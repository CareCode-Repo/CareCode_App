'use client'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import AuthGuard from '@/components/common/AuthGuard'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import HealthRecordForm, {
  HealthRecordFormValues,
  toLocalDateTime,
} from '@/components/features/health/HealthRecordForm'
import { useMyChildren } from '@/queries/child'
import { useHealthRecord, useUpdateHealthRecord } from '@/queries/health'
import { RecordType, UpdateHealthRecordBody } from '@/types/apis/health'

/** 서버가 주는 날짜(yyyy-MM-dd 또는 ISO)를 datetime-local 입력 값으로 맞춘다. */
const toInputDateTime = (value?: string | null): string => {
  if (!value) return ''
  return value.length === 10 ? `${value}T00:00` : value.slice(0, 16)
}

const toUpdateBody = (values: HealthRecordFormValues): UpdateHealthRecordBody => ({
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

const EditHealthRecordPage = (): ReactElement => {
  const params = useParams<{ recordId: string }>()
  const recordId = Number(params?.recordId)
  const router = useRouter()

  const { data: record, isLoading, isError, refetch } = useHealthRecord(recordId)
  const { data: children = [] } = useMyChildren()
  const {
    mutate: updateRecord,
    isPending,
    isError: isUpdateError,
  } = useUpdateHealthRecord(recordId)

  if (isError) {
    return (
      <Layout hasTopNav hasBackButton title="건강 기록 수정">
        <ErrorView content="건강 기록을 불러오지 못했어요." onRetry={() => refetch()} />
      </Layout>
    )
  }

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="건강 기록 수정" contentClassName="px-4.5 py-5">
        {isLoading || !record ? (
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        ) : (
          <HealthRecordForm
            mode="edit"
            childOptions={children}
            isPending={isPending}
            isError={isUpdateError}
            submitLabel="수정 저장"
            defaultValues={{
              childId: record.childId ?? '',
              recordType: record.recordType as RecordType,
              title: record.title,
              description: record.description ?? '',
              recordDate: toInputDateTime(record.recordDate),
              nextDate: toInputDateTime(record.nextDate),
              hospitalName: record.hospitalName ?? '',
              doctorName: record.doctorName ?? '',
              height: record.height != null ? String(record.height) : '',
              weight: record.weight != null ? String(record.weight) : '',
              temperature: record.temperature != null ? String(record.temperature) : '',
            }}
            onSubmit={(values) =>
              updateRecord(toUpdateBody(values), {
                onSuccess: () => router.replace(`/health/${recordId}`),
              })
            }
          />
        )}
      </Layout>
    </AuthGuard>
  )
}

export default EditHealthRecordPage
