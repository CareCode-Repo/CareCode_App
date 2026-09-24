import { ReactElement } from 'react'

import FacilityStat from './FacilityStat'
import ReviewIcon from '@/assets/icons/chat_small.svg'
import StarIcon from '@/assets/icons/star_small.svg'
import Chip from '@/components/common/Chip'
import DescriptionItem from '@/components/common/DescriptionItem'
import Spacer from '@/components/common/Spacer'
import Tag from '@/components/common/Tag'
import { FacilityType } from '@/types/facility'

type FacilityCardProps = {
  type: FacilityType
  tags: string[]
  title: string
  region: string
  phoneNumber: string
  reviewCount: number
  rating: number
  onClick?: () => void
}
const FacilityCard = ({
  type,
  tags,
  title,
  region,
  phoneNumber,
  reviewCount,
  rating,
  onClick,
}: FacilityCardProps): ReactElement => {
  const getChipColor = () => {
    switch (type) {
      case '센터':
        return 'purple'
      case '어린이집':
        return 'yellow'
      case '유치원':
        return 'blue'
    }
  }
  return (
    <div
      role="button"
      className="flex w-[18rem] cursor-pointer items-center justify-between rounded-lg bg-gray-100 p-4.5 transition-colors hover:bg-gray-200"
      onClick={onClick}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5">
          <Chip color={getChipColor()}>{type}</Chip>
          {tags.map((tag) => (
            <Tag key={tag} tag={tag} />
          ))}
        </div>
        <Spacer className="h-2.5" />
        <h3 className="text-b1-medium text-black">{title}</h3>
        <Spacer className="h-3.5" />
        <dl className="flex flex-col gap-1">
          <DescriptionItem title="지역" content={region} />
          <DescriptionItem title="번호" content={phoneNumber} />
          <div className="flex items-center gap-5.5">
            <FacilityStat icon={ReviewIcon} value={reviewCount} />
            <FacilityStat icon={StarIcon} value={rating} />
          </div>
        </dl>
      </div>
      {/* <div className="flex flex-col gap-1 items-center">
        <button className="border border-gray-800 rounded-full p-1.5">
          <MapIcon className="w-4.5 h-4.5 text-gray-500 fill-gray-800" />
        </button>
        <span className="text-c1-regular text-gray-800">경로</span>
      </div> */}
    </div>
  )
}

export default FacilityCard
