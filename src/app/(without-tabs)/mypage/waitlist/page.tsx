'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import { useMyWaitlists, useResolveWaitlist } from '@/queries/waitlist'
import { WAITLIST_STATUS_LABEL, WaitlistEntry } from '@/types/apis/waitlist'
import { formatDate } from '@/utils/date'

const STATUS_COLOR: Record<string, 'green' | 'yellow' | 'white'> = {
  WAITING: 'yellow',
  ADMITTED: 'green',
  GAVE_UP: 'white',
}

interface PendingResolve {
  entry: WaitlistEntry
  status: 'ADMITTED' | 'GAVE_UP'
}

const MyWaitlistPage = (): ReactElement => {
  const router = useRouter()
  const [pending, setPending] = useState<PendingResolve | null>(null)

  const { data: entries = [], isLoading, isError, refetch } = useMyWaitlists()
  const { mutate: resolve, isPending } = useResolveWaitlist()

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="내 대기" contentClassName="px-4.5 py-5">
        <p className="text-c1-regular pb-4 text-gray-600">
          입소하거나 포기하면 결과를 남겨주세요. 그 기록이 모여 다른 부모님께 &quot;실제로 얼마나
          기다렸는지&quot;를 알려줍니다.
        </p>

        {isLoading ? (
          <ul className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </ul>
        ) : isError ? (
          <ErrorView content="대기 목록을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : !entries.length ? (
          <EmptyState
            title="등록된 대기가 없어요"
            description={
              '시설 상세에서 대기 신청을 기록해두면\n입소까지 얼마나 걸리는지 알 수 있어요.'
            }
            actionLabel="시설 찾아보기"
            onAction={() => router.push('/facility')}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => {
              const isWaiting = entry.status === 'WAITING'

              return (
                <li
                  key={entry.waitlistId}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <Chip color={STATUS_COLOR[entry.status] ?? 'white'}>
                      {entry.statusName ?? WAITLIST_STATUS_LABEL[entry.status] ?? entry.status}
                    </Chip>
                    {entry.waitNumber != null && (
                      <span className="text-b1-semibold text-gray-800">
                        {`대기 ${entry.waitNumber}번`}
                      </span>
                    )}
                  </div>

                  <span className="text-b2-regular text-gray-600">
                    {`신청 ${formatDate(entry.appliedAt)}`}
                    {entry.waitedDays != null && ` · ${entry.waitedDays}일 경과`}
                  </span>

                  {entry.facilityId != null && (
                    <button
                      type="button"
                      onClick={() => router.push(`/facility/${entry.facilityId}`)}
                      className="text-b2-semibold self-start text-green-700 underline"
                    >
                      시설 보기
                    </button>
                  )}

                  {isWaiting && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        color="green"
                        size="small"
                        disabled={isPending}
                        onClick={() => setPending({ entry, status: 'ADMITTED' })}
                      >
                        입소했어요
                      </Button>
                      <Button
                        color="gray"
                        size="small"
                        disabled={isPending}
                        onClick={() => setPending({ entry, status: 'GAVE_UP' })}
                      >
                        포기했어요
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <AlertDialog
          title={pending?.status === 'ADMITTED' ? '입소로 기록할까요?' : '포기로 기록할까요?'}
          description={
            pending?.status === 'ADMITTED'
              ? '대기 기간이 확정되고, 다른 부모님이 보는 통계에 반영돼요.'
              : '대기 기록이 종료됩니다.'
          }
          isOpen={!!pending}
          onClose={() => setPending(null)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setPending(null)}>
              취소
            </Button>
          }
          confirmButton={
            <Button
              color={pending?.status === 'ADMITTED' ? 'green' : 'red'}
              size="small"
              disabled={isPending}
              onClick={() =>
                pending &&
                resolve(
                  { waitlistId: pending.entry.waitlistId, status: pending.status },
                  { onSettled: () => setPending(null) },
                )
              }
            >
              기록
            </Button>
          }
        />
      </Layout>
    </AuthGuard>
  )
}

export default MyWaitlistPage
