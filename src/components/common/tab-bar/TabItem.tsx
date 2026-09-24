import clsx from 'clsx'
import Link from 'next/link'
import { ComponentType, ReactElement } from 'react'

export interface TabItemProps {
  title: string
  icon: ComponentType<React.SVGProps<SVGSVGElement>>
  url: string
  selected: boolean
}

export const TabItem = ({ title, icon: Icon, url, selected }: TabItemProps): ReactElement => {
  return (
    <li className="flex flex-1">
      {/*
        router.push 를 붙인 button 이 아니라 Link 여야 한다.
        - Next 가 뷰포트에 들어온 탭을 미리 받아둔다(체감 전환 속도)
        - href 가 있어야 새 탭 열기·휠 클릭이 동작한다
        - 스크린리더에 "링크"로 읽히고, 현재 탭은 aria-current 로 전달된다
      */}
      <Link
        href={url}
        aria-current={selected ? 'page' : undefined}
        className="flex flex-1 flex-col items-center justify-center gap-1 rounded focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
      >
        <Icon
          className={clsx('size-8', selected ? 'fill-green-500' : 'fill-gray-700')}
          aria-hidden
        />
        <span className={clsx('text-c1-regular', selected ? 'text-green-600' : 'text-gray-700')}>
          {title}
        </span>
      </Link>
    </li>
  )
}
