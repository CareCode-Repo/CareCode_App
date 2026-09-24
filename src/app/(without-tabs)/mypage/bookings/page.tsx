'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import DescriptionItem from '@/components/common/DescriptionItem'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import { useCancelBooking, useMyBookings } from '@/queries/facility'
import { BOOKING_STATUS_LABEL, BOOKING_TYPE_LABEL, BookingType } from '@/types/apis/facility'
import { formatDate } from '@/utils/date'

const STATUS_COLOR: Record<string, 'green' | 'yellow' | 'red' | 'white'> = {
  CONFIRMED: 'green',
  PENDING: 'yellow',
  CANCELLED: 'red',
  REJECTED: 'red',
  COMPLETED: 'white',
}

const BookingsPage = (): ReactElement => {
  const router = useRouter()
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)

  const { data: bookings = [], isLoading, isError, refetch } = useMyBookings()
  const { mutate: cancel, isPending: isCancelling } = useCancelBooking()

  const handleCancel = () => {
    if (cancelTarget == null) return
    cancel(cancelTarget, { onSettled: () => setCancelTarget(null) })
  }

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="내 예약" contentClassName="px-4.5 py-5">
        {isLoading ? (
          <ul className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <li key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </ul>
        ) : isError ? (
          <ErrorView content="예약 내역을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : !bookings.length ? (
          <EmptyState
            title="예약 내역이 없어요"
            description="관심 있는 시설에 방문 예약을 신청해보세요."
            actionLabel="시설 찾아보기"
            onAction={() => router.push('/facility')}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {bookings.map((booking) => {
              const status = booking.status ?? 'PENDING'
              const isCancellable = status === 'PENDING' || status === 'CONFIRMED'

              return (
                <li
                  key={booking.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-b1-semibold truncate text-gray-800"
                      onClick={() =>
                        booking.facilityId && router.push(`/facility/${booking.facilityId}`)
                      }
                    >
                      {booking.facilityName ?? '시설 정보 없음'}
                    </button>
                    <Chip color={STATUS_COLOR[status] ?? 'white'}>
                      {BOOKING_STATUS_LABEL[status] ?? status}
                    </Chip>
                  </div>

                  <dl className="flex flex-col gap-1">
                    <DescriptionItem
                      title="일시"
                      content={formatDate(booking.startTime, 'yyyy.MM.dd HH:mm')}
                    />
                    <DescriptionItem
                      title="유형"
                      content={
                        BOOKING_TYPE_LABEL[booking.bookingType as BookingType] ??
                        booking.bookingType ??
                        '-'
                      }
                    />
                    <DescriptionItem title="아이" content={booking.childName ?? '-'} />
                  </dl>

                  {isCancellable && (
                    <Button
                      color="gray"
                      size="small"
                      className="mt-1"
                      onClick={() => setCancelTarget(booking.id)}
                    >
                      예약 취소
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <AlertDialog
          title="예약을 취소할까요?"
          description="취소한 예약은 되돌릴 수 없어요."
          isOpen={cancelTarget != null}
          onClose={() => setCancelTarget(null)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setCancelTarget(null)}>
              닫기
            </Button>
          }
          confirmButton={
            <Button color="red" size="small" onClick={handleCancel} disabled={isCancelling}>
              취소하기
            </Button>
          }
        />
      </Layout>
    </AuthGuard>
  )
}

export default BookingsPage
