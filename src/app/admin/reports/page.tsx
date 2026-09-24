'use client'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import { usePendingReports, useResolveReport } from '@/queries/admin'
import { ReportStatus } from '@/types/apis/admin'
import { REPORT_STATUS_LABEL } from '@/types/apis/moderation'
import { formatDate } from '@/utils/date'

const TARGET_TYPE_LABEL: Record<string, string> = {
  POST: '게시글',
  COMMENT: '댓글',
}

interface PendingResolve {
  reportId: number
  status: ReportStatus
}

const AdminReportsPage = (): ReactElement => {
  const [page, setPage] = useState(0)
  const [pendingResolve, setPendingResolve] = useState<PendingResolve | null>(null)

  const { data, isLoading, isError, refetch } = usePendingReports(page)
  const { mutate: resolve, isPending } = useResolveReport()

  const reports = data?.content ?? []

  const handleConfirm = () => {
    if (!pendingResolve) return
    resolve(pendingResolve, { onSettled: () => setPendingResolve(null) })
  }

  if (isError) {
    return <ErrorView content="신고 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !reports.length ? (
        <EmptyState title="처리할 신고가 없어요" description="새 신고가 들어오면 여기에 쌓여요." />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`미처리 ${data?.totalElements ?? reports.length}건`}
          </p>

          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <Chip color="red">{report.reasonDisplay ?? report.reason}</Chip>
                  <Chip color="white">
                    {TARGET_TYPE_LABEL[report.targetType] ?? report.targetType}
                  </Chip>
                  <span className="text-c1-regular ml-auto text-gray-500">
                    {formatDate(report.createdAt, 'MM.dd HH:mm')}
                  </span>
                </div>

                <span className="text-b2-regular text-gray-600">
                  {`대상 ID ${report.targetId} · 상태 ${REPORT_STATUS_LABEL[report.status] ?? report.status}`}
                </span>

                {report.detail && (
                  <p className="text-b1-regular whitespace-pre-line text-gray-700">
                    {report.detail}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    color="gray"
                    size="small"
                    disabled={isPending}
                    onClick={() => setPendingResolve({ reportId: report.id, status: 'REJECTED' })}
                  >
                    반려
                  </Button>
                  <Button
                    color="red"
                    size="small"
                    disabled={isPending}
                    onClick={() => setPendingResolve({ reportId: report.id, status: 'ACCEPTED' })}
                  >
                    숨김 처리
                  </Button>
                </div>
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

      {/* 숨김은 사용자 콘텐츠를 내리는 조치라 되묻는다 */}
      <AlertDialog
        title={pendingResolve?.status === 'ACCEPTED' ? '숨김 처리할까요?' : '신고를 반려할까요?'}
        description={
          pendingResolve?.status === 'ACCEPTED'
            ? '신고된 게시글 또는 댓글이 목록에서 보이지 않게 됩니다.'
            : '신고를 반려하면 대상은 그대로 유지됩니다.'
        }
        isOpen={!!pendingResolve}
        onClose={() => setPendingResolve(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setPendingResolve(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color={pendingResolve?.status === 'ACCEPTED' ? 'red' : 'green'}
            size="small"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {pendingResolve?.status === 'ACCEPTED' ? '숨김 처리' : '반려'}
          </Button>
        }
      />
    </div>
  )
}

export default AdminReportsPage
