'use client'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import { useAdminHealthRecords, useDeleteAdminHealthRecord } from '@/queries/admin'
import { HealthRecord, RECORD_TYPE_LABEL, RecordType } from '@/types/apis/health'
import { formatDate } from '@/utils/date'

const AdminHealthRecordsPage = (): ReactElement => {
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<HealthRecord | null>(null)

  const { data, isLoading, isError, refetch } = useAdminHealthRecords(page)
  const { mutate: deleteRecord, isPending } = useDeleteAdminHealthRecord()

  const records = data?.content ?? []

  if (isError) {
    return <ErrorView content="건강기록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 건강정보는 민감정보다. 관리 목적 외 열람은 남기지 않는 편이 낫다는 점을 명시한다. */}
      <section className="rounded-lg bg-gray-100 p-4">
        <p className="text-b2-semibold text-gray-800">민감정보 열람 주의</p>
        <p className="text-c1-regular pt-1 text-gray-600">
          건강 정보는 개인정보보호법상 민감정보입니다. 장애 대응·삭제 요청 처리 등 꼭 필요한
          경우에만 확인해주세요. 측정값은 목록에 표시하지 않습니다.
        </p>
      </section>

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !records.length ? (
        <EmptyState title="건강기록이 없어요" />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`총 ${data?.totalElements ?? records.length}건`}
          </p>

          <ul className="flex flex-col gap-2">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <Chip color="white">
                    {RECORD_TYPE_LABEL[record.recordType as RecordType] ?? record.recordType}
                  </Chip>
                  <span className="text-b1-semibold truncate text-gray-800">{record.title}</span>
                </div>

                <span className="text-c1-regular text-gray-500">
                  {`기록 ${formatDate(record.recordDate)} · 사용자 ${record.userId ?? '-'}`}
                </span>

                <Button
                  color="red"
                  size="small"
                  className="mt-1"
                  disabled={isPending}
                  onClick={() => setDeleteTarget(record)}
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

      <AlertDialog
        title="건강기록을 삭제할까요?"
        description="첨부파일과 성장 곡선 데이터도 함께 사라집니다. 복구할 수 없어요."
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
            disabled={isPending}
            onClick={() =>
              deleteTarget &&
              deleteRecord(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
            }
          >
            삭제
          </Button>
        }
      />
    </div>
  )
}

export default AdminHealthRecordsPage
