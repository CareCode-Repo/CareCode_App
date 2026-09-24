'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import BabyIcon from '@/assets/icons/baby.svg'
import BuildingIcon from '@/assets/icons/building.svg'
import CompassIcon from '@/assets/icons/compass.svg'
import HeartIcon from '@/assets/icons/leaf.svg'
import PhoneIcon from '@/assets/icons/phone_small.svg'

const MENUS = [
  { icon: CompassIcon, label: '지역 비교', href: '/benefits/regional' },
  { icon: BabyIcon, label: '아이 관리', href: '/children' },
  { icon: HeartIcon, label: '건강 기록', href: '/health' },
  { icon: PhoneIcon, label: '병원 찾기', href: '/hospital' },
  { icon: BuildingIcon, label: '시설 찾기', href: '/facility' },
]

/** 홈에서 주요 기능으로 한 번에 이동하는 바로가기. */
const QuickMenu = (): ReactElement => {
  const router = useRouter()

  return (
    <nav aria-label="바로가기" className="rounded-lg border border-gray-200 bg-white p-4">
      <ul className="flex justify-between gap-1">
        {MENUS.map(({ icon: Icon, label, href }) => (
          <li key={href}>
            <button
              type="button"
              onClick={() => router.push(href)}
              className="flex w-14 cursor-pointer flex-col items-center gap-1.5"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-green-50">
                <Icon className="size-6 fill-green-700" aria-hidden />
              </span>
              <span className="text-c1-regular text-gray-700">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default QuickMenu
