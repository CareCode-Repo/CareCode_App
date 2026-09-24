'use client'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'
import { TabItem } from './TabItem'

import SearchIcon from '@/assets/icons/book.svg'
import ChatIcon from '@/assets/icons/chat.svg'
import HomeIcon from '@/assets/icons/home.svg'
import CommunityIcon from '@/assets/icons/leaf.svg'
import UserIcon from '@/assets/icons/user.svg'

/**
 * 하단 탭. 여기 있는 경로는 모두 `(with-tabs)` 그룹 안에 있어야 한다.
 * 그룹 밖 경로를 넣으면 그 탭을 누르는 순간 탭 바 자체가 사라진다.
 */
const tabData = [
  { title: '커뮤니티', icon: CommunityIcon, url: '/community' },
  { title: '육아 정보', icon: SearchIcon, url: '/search' },
  { title: '홈', icon: HomeIcon, url: '/home' },
  { title: '챗봇 상담', icon: ChatIcon, url: '/chat' },
  { title: '마이페이지', icon: UserIcon, url: '/mypage' },
]

export interface TabBarProps {
  className?: string
}

const TabBar = ({ className }: TabBarProps): ReactElement => {
  const pathname = usePathname() ?? ''

  /**
   * 활성 탭은 경로에서 곧바로 파생한다.
   * state + useEffect 로 맞추면 첫 렌더에 항상 첫 탭이 켜졌다가 뒤늦게 바뀐다.
   * 하위 경로(`/community/write` 등)도 해당 탭을 활성으로 본다.
   */
  const isActive = (url: string): boolean => pathname === url || pathname.startsWith(`${url}/`)

  return (
    <nav
      aria-label="주요 메뉴"
      className={clsx(
        'z-10 w-full rounded-t-2xl bg-white px-6 py-3 shadow-[0_-2px_8px_0_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <ul className="flex w-full gap-2">
        {tabData.map((item) => (
          <TabItem key={item.url} {...item} selected={isActive(item.url)} />
        ))}
      </ul>
    </nav>
  )
}

export default TabBar
