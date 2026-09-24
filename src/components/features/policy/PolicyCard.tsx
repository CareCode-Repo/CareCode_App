'use client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import Chip from '@/components/common/Chip'
import DescriptionItem from '@/components/common/DescriptionItem'
import Spacer from '@/components/common/Spacer'
import Tag from '@/components/common/Tag'
import { PolicyCardProps, getChipColor } from '@/types/policy'

const PolicyCard = ({
  id,
  type,
  tags,
  title,
  description,
  region,
  targetAge,
  applicationPeriod,
  dday,
  className,
}: PolicyCardProps): ReactElement => {
  const router = useRouter()
  const handleClick = () => router.push(`/policy/${id}`)
  return (
    <div
      role="button"
      className={clsx(
        'flex cursor-pointer flex-col rounded-lg bg-gray-100 pt-3.5 pr-3.5 pb-[1.125rem] pl-3.5 transition-colors hover:bg-gray-200',
        className,
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2.5">
        <Chip color={getChipColor(type)}>{(dday && `D-${dday}`) || type}</Chip>
        {tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </div>
      <Spacer className="h-2.5" />
      <h3 className="text-b1-medium text-black">{title}</h3>
      <p className="text-c1-regular truncate text-gray-700">{description}</p>
      <Spacer className="h-3.5" />
      <dl className="flex flex-col gap-0.5">
        <DescriptionItem title="지역" content={region} />
        <DescriptionItem title="연령" content={targetAge} />
        <DescriptionItem title="신청기간" content={applicationPeriod} />
      </dl>
    </div>
  )
}

export default PolicyCard
