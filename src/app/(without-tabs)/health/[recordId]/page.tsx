'use client'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import DescriptionItem from '@/components/common/DescriptionItem'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Separator from '@/components/common/Separator'
import AttachmentSection from '@/components/features/health/AttachmentSection'
import { useDeleteHealthRecord, useHealthRecord } from '@/queries/health'
import { RECORD_TYPE_LABEL, RecordType } from '@/types/apis/health'
import { formatDate } from '@/utils/date'

const HealthRecordDetailPage = (): ReactElement => {
  const params = useParams<{ recordId: string }>()
  const recordId = Number(params?.recordId)
  const router = useRouter()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: record, isLoading, isError, refetch } = useHealthRecord(recordId)
  const { mutate: removeRecord, isPending: isDeleting } = useDeleteHealthRecord()

  if (isError) {
    return (
      <Layout hasTopNav hasBackButton title="건강 기록">
        <ErrorView content="건강 기록을 불러오지 못했어요." onRetry={() => refetch()} />
      </Layout>
    )
  }

  const typeLabel = record
    ? (RECORD_TYPE_LABEL[record.recordType as RecordType] ?? record.recordType)
    : ''

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="건강 기록" contentClassName="px-4.5 py-5">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Chip color="green">{typeLabel}</Chip>
                <h1 className="text-t2-semibold truncate text-gray-900">{record?.title}</h1>
              </div>

              <dl className="flex flex-col gap-1.5">
                <DescriptionItem title="기록일" content={formatDate(record?.recordDate)} />
                {record?.childName && <DescriptionItem title="아이" content={record.childName} />}
                {record?.hospitalName && (
                  <DescriptionItem title="병원" content={record.hospitalName} />
                )}
                {record?.doctorName && (
                  <DescriptionItem title="담당의" content={record.doctorName} />
                )}
                {record?.nextDate && (
                  <DescriptionItem title="다음 예정" content={formatDate(record.nextDate)} />
                )}
              </dl>

              {record?.description && (
                <p className="text-b1-regular whitespace-pre-line text-gray-700">
                  {record.description}
                </p>
              )}
            </section>

            {/* 측정값 */}
            {(record?.height != null ||
              record?.weight != null ||
              record?.temperature != null ||
              record?.bloodPressure ||
              record?.pulseRate != null) && (
              <section className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="text-b1-semibold text-gray-800">측정값</h2>
                <dl className="grid grid-cols-2 gap-2">
                  {record?.height != null && (
                    <DescriptionItem title="키" content={`${record.height}cm`} />
                  )}
                  {record?.weight != null && (
                    <DescriptionItem title="몸무게" content={`${record.weight}kg`} />
                  )}
                  {record?.temperature != null && (
                    <DescriptionItem title="체온" content={`${record.temperature}℃`} />
                  )}
                  {record?.pulseRate != null && (
                    <DescriptionItem title="맥박" content={`${record.pulseRate}회/분`} />
                  )}
                  {record?.bloodPressure && (
                    <DescriptionItem title="혈압" content={record.bloodPressure} />
                  )}
                </dl>
                {record?.childId && (
                  <button
                    type="button"
                    onClick={() => router.push(`/children/${record.childId}`)}
                    className="text-b2-semibold self-start text-green-700 underline"
                  >
                    성장 곡선에서 보기
                  </button>
                )}
              </section>
            )}

            <Separator />

            <AttachmentSection recordId={recordId} />

            <div className="flex gap-2 pt-2">
              <Button
                color="gray"
                size="small"
                onClick={() => router.push(`/health/${recordId}/edit`)}
              >
                수정
              </Button>
              <Button color="red" size="small" onClick={() => setDeleteDialogOpen(true)}>
                삭제
              </Button>
            </div>
          </div>
        )}

        <AlertDialog
          title="기록을 삭제할까요?"
          description="첨부파일도 함께 삭제되며 복구할 수 없어요."
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
          }
          confirmButton={
            <Button
              color="red"
              size="small"
              disabled={isDeleting}
              onClick={() => removeRecord(recordId, { onSuccess: () => router.replace('/health') })}
            >
              삭제
            </Button>
          }
        />
      </Layout>
    </AuthGuard>
  )
}

export default HealthRecordDetailPage
