'use client'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Spacer from '@/components/common/Spacer'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import { useAdminBookings, useBookingStats, useUpdateBookingStatus } from '@/queries/admin'
import {
  AdminBooking,
  BOOKING_STATUS_LABEL,
  BookingStatus,
  BookingStatus as BookingStatusValues,
} from '@/types/apis/admin'
import { formatDate } from '@/utils/date'

const STATUS_COLOR: Record<string, 'green' | 'yellow' | 'red' | 'white'> = {
  CONFIRMED: 'green',
  PENDING: 'yellow',
  CANCELLED: 'red',
  REJECTED: 'red',
  COMPLETED: 'white',
}

/** 대기 중인 예약에 대해 관리자가 내릴 수 있는 결정. */
const DECISIONS: { status: BookingStatus; label: string; color: 'green' | 'red' }[] = [
  { status: 'CONFIRMED', label: '확정', color: 'green' },
  { status: 'REJECTED', label: '반려', color: 'red' },
]

interface PendingDecision {
  booking: AdminBooking
  status: BookingStatus
}

const AdminBookingsPage = (): ReactElement => {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [keyword, setKeyword] = useState('')
  const [decision, setDecision] = useState<PendingDecision | null>(null)

  const { data: stats } = useBookingStats()
  const { data, isLoading, isError, refetch } = useAdminBookings({
    page,
    size: 20,
    status: statusFilter ?? undefined,
    keyword: keyword || undefined,
  })
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus()

  const bookings = data?.bookings ?? []

  const summary = [
    { label: '대기', value: stats?.pendingBookings },
    { label: '확정', value: stats?.confirmedBookings },
    { label: '오늘', value: stats?.todayBookings },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(0)
    setKeyword(inputValue.trim())
  }

  if (isError) {
    return <ErrorView content="예약 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-3 gap-2">
        {summary.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3"
          >
            <span className="text-c1-regular text-gray-600">{item.label}</span>
            <span className="text-t2-semibold text-gray-900">
              {item.value?.toLocaleString('ko-KR') ?? '-'}
            </span>
          </div>
        ))}
      </section>

      <form onSubmit={handleSubmit}>
        <Input
          value={inputValue}
          placeholder="시설명·아이 이름으로 검색"
          onChange={setInputValue}
        />
      </form>

      <div className="scrollbar-hide flex gap-2.5 overflow-x-auto [&>*]:shrink-0">
        {BookingStatusValues.map((status) => (
          <ToggleChip
            key={status}
            pressed={statusFilter === status}
            onPressedChange={(pressed) => {
              setPage(0)
              setStatusFilter(pressed ? status : null)
            }}
          >
            {BOOKING_STATUS_LABEL[status]}
          </ToggleChip>
        ))}
      </div>

      <Spacer className="h-1 shrink-0" />

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !bookings.length ? (
        <EmptyState
          title="조건에 맞는 예약이 없어요"
          description={statusFilter || keyword ? '필터나 검색어를 지워보세요.' : undefined}
        />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`총 ${data?.totalElements ?? bookings.length}건`}
          </p>

          <ul className="flex flex-col gap-2">
            {bookings.map((booking) => {
              const status = booking.status ?? 'PENDING'

              return (
                <li
                  key={booking.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <Chip color={STATUS_COLOR[status] ?? 'white'}>
                      {BOOKING_STATUS_LABEL[status] ?? status}
                    </Chip>
                    <span className="text-b1-semibold truncate text-gray-800">
                      {booking.facilityName ?? '시설 정보 없음'}
                    </span>
                  </div>

                  <span className="text-b2-regular text-gray-600">
                    {`${booking.childName ?? '-'} · 신청자 ${booking.userName ?? booking.userId ?? '-'}`}
                  </span>
                  <span className="text-c1-regular text-gray-500">
                    {`방문 ${formatDate(booking.startTime, 'yyyy.MM.dd HH:mm')} · 신청 ${formatDate(booking.createdAt, 'MM.dd')}`}
                  </span>

                  {/* 이미 확정·완료·취소된 건은 되돌릴 이유가 드물어 대기 상태에서만 결정을 노출한다 */}
                  {status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      {DECISIONS.map((item) => (
                        <Button
                          key={item.status}
                          color={item.color}
                          size="small"
                          disabled={isPending}
                          onClick={() => setDecision({ booking, status: item.status })}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {data?.hasNext && (
            <Button color="gray" size="small" onClick={() => setPage((prev) => prev + 1)}>
              더 보기
            </Button>
          )}
        </>
      )}

      <AlertDialog
        title={decision?.status === 'CONFIRMED' ? '예약을 확정할까요?' : '예약을 반려할까요?'}
        description={
          decision?.status === 'CONFIRMED'
            ? '신청자에게 확정 알림이 전달됩니다.'
            : '신청자에게 반려 사실이 전달됩니다.'
        }
        isOpen={!!decision}
        onClose={() => setDecision(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setDecision(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color={decision?.status === 'CONFIRMED' ? 'green' : 'red'}
            size="small"
            disabled={isPending}
            onClick={() =>
              decision &&
              updateStatus(
                { bookingId: decision.booking.id, body: { status: decision.status } },
                { onSettled: () => setDecision(null) },
              )
            }
          >
            {decision?.status === 'CONFIRMED' ? '확정' : '반려'}
          </Button>
        }
      />
    </div>
  )
}

export default AdminBookingsPage
