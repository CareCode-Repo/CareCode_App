import { ReactElement } from 'react'
import Chip from '@/components/common/Chip'
import { Child } from '@/types/apis/child'
import { formatChildAge, formatDate } from '@/utils/date'

interface ChildCardProps {
  child: Child
  overdueCount?: number
  onClick?: () => void
}

const GENDER_LABEL: Record<string, string> = {
  MALE: '남아',
  FEMALE: '여아',
  M: '남아',
  F: '여아',
}

const ChildCard = ({ child, overdueCount = 0, onClick }: ChildCardProps): ReactElement => {
  const genderLabel = child.gender
    ? (GENDER_LABEL[child.gender.toUpperCase()] ?? child.gender)
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-b1-semibold text-gray-800">{child.name}</span>
          {genderLabel && (
            <Chip color="white" size="sm">
              {genderLabel}
            </Chip>
          )}
          {overdueCount > 0 && <Chip color="red" size="sm">{`미접종 ${overdueCount}`}</Chip>}
        </div>
        <span className="text-b2-regular text-gray-600">
          {formatChildAge(child.birthDate)} · {formatDate(child.birthDate)}
        </span>
      </div>
      <span className="text-b2-regular text-gray-500" aria-hidden>
        보기
      </span>
    </button>
  )
}

export default ChildCard
