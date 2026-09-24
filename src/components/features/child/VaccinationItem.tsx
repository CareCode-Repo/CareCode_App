import clsx from 'clsx'
import { ReactElement } from 'react'
import Chip from '@/components/common/Chip'
import { VaccinationSchedule } from '@/types/apis/child'
import { formatDate } from '@/utils/date'

interface VaccinationItemProps {
  schedule: VaccinationSchedule
  isCompleting?: boolean
  onComplete?: () => void
}

const VaccinationItem = ({
  schedule,
  isCompleting = false,
  onComplete,
}: VaccinationItemProps): ReactElement => {
  const isCompleted = schedule.status === 'COMPLETED'
  const doseLabel =
    schedule.doseNumber && schedule.totalDoses
      ? `${schedule.doseNumber}차 / 총 ${schedule.totalDoses}회`
      : null

  return (
    <li
      className={clsx(
        'flex items-center justify-between gap-3 border-b border-gray-200 px-4.5 py-3.5 last:border-b-0',
        isCompleted && 'bg-gray-50',
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'text-b1-semibold truncate',
              isCompleted ? 'text-gray-500 line-through' : 'text-gray-800',
            )}
          >
            {schedule.vaccineName ?? schedule.vaccineType}
          </span>
          {schedule.overdue && !isCompleted && (
            <Chip color="red" size="sm">
              기한 경과
            </Chip>
          )}
        </div>
        <span className="text-b2-regular text-gray-600">
          {isCompleted
            ? `${formatDate(schedule.completedDate)} 접종 완료`
            : `${formatDate(schedule.dueDate)} 예정`}
          {doseLabel && ` · ${doseLabel}`}
        </span>
      </div>

      {!isCompleted && onComplete && (
        <button
          type="button"
          onClick={onComplete}
          disabled={isCompleting}
          className="text-b2-semibold shrink-0 rounded-full border border-green-600 px-3 py-1.5 text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
        >
          {isCompleting ? '처리 중' : '접종 완료'}
        </button>
      )}
    </li>
  )
}

export default VaccinationItem
