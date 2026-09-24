import { ReactElement } from 'react'
import ReviewIcon from '@/assets/icons/chat_small.svg'
import StarIcon from '@/assets/icons/star_small.svg'
import Chip from '@/components/common/Chip'
import { Facility, FACILITY_TYPE_LABEL, FacilityType } from '@/types/apis/facility'

interface FacilityListItemProps {
  facility: Facility
  onClick?: () => void
}

const CHIP_COLOR: Record<string, 'purple' | 'yellow' | 'blue' | 'white'> = {
  KINDERGARTEN: 'blue',
  DAYCARE: 'yellow',
  PLAYGROUP: 'purple',
  NURSERY: 'purple',
}

/** 목록/검색 결과용 시설 행. 세로 목록에 맞게 폭을 채운다. */
const FacilityListItem = ({ facility, onClick }: FacilityListItemProps): ReactElement => {
  const type = facility.facilityType ?? undefined
  const typeLabel = type ? (FACILITY_TYPE_LABEL[type as FacilityType] ?? type) : '기타'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <Chip color={type ? (CHIP_COLOR[type] ?? 'white') : 'white'}>{typeLabel}</Chip>
        <span className="text-b1-semibold truncate text-gray-800">{facility.name}</span>
      </div>

      {facility.address && (
        <span className="text-b2-regular truncate text-gray-600">{facility.address}</span>
      )}

      <div className="text-c1-regular flex items-center gap-4 text-gray-700">
        <span className="flex items-center gap-1">
          <StarIcon className="size-3.5 fill-gray-700" aria-hidden />
          {facility.rating != null ? facility.rating.toFixed(1) : '평점 없음'}
        </span>
        <span className="flex items-center gap-1">
          <ReviewIcon className="size-3.5 fill-gray-700" aria-hidden />
          {`리뷰 ${facility.reviewCount ?? 0}`}
        </span>
        {facility.phoneNumber && <span className="truncate">{facility.phoneNumber}</span>}
      </div>
    </button>
  )
}

export default FacilityListItem
