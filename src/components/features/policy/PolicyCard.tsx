'use client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import Chip from '@/components/common/Chip'
import DescriptionItem from '@/components/common/DescriptionItem'
import Spacer from '@/components/common/Spacer'
import Tag from '@/components/common/Tag'
import { PolicyCardProps, getChipColor } from '@/types/policy'
import { routes } from '@/utils/routes'

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
  const handleClick = () => router.push(routes.policyDetail(id))
  return (
    /*
      role 만 button 이고 tabIndex·onKeyDown 이 없어 Tab 으로 닿지도, Enter 로 눌리지도
      않았다. 홈의 정책 카드 열 개가 전부 키보드·스위치 컨트롤에서 막혀 있었다.
      카드 안에 제목(h3)이 있어 button 으로 감싸면 그 구조가 사라지므로, role 은 그대로
      두고 키보드 동작만 채운다.
    */
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        // Space 는 그대로 두면 화면이 스크롤된다.
        e.preventDefault()
        handleClick()
      }}
      className={clsx(
        'focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:outline-none',
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
