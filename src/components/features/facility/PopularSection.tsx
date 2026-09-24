'use client'
import { ReactElement } from 'react'

interface PopularItem {
  id: number
  name?: string | null
  subtitle?: string | null
}

interface PopularSectionProps {
  title: string
  items: PopularItem[]
  onSelect: (id: number) => void
}

/**
 * 목록 위에 얹는 "많이 찾는" 줄.
 *
 * 표본이 없으면 서버가 빈 배열을 준다. 그때는 아무것도 그리지 않는다 —
 * 빈 카드를 띄우면 기능이 고장 난 것처럼 보인다.
 */
const PopularSection = ({ title, items, onSelect }: PopularSectionProps): ReactElement | null => {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-2 pb-5">
      <span className="text-b1-semibold text-gray-800">{title}</span>
      <div className="scrollbar-hide -mx-4.5 flex gap-2.5 overflow-x-auto px-4.5 [&>*]:shrink-0">
        {items.slice(0, 10).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="flex w-40 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 text-left focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
          >
            <span className="text-b2-semibold line-clamp-2 text-gray-800">
              {item.name ?? '이름 없음'}
            </span>
            {item.subtitle && (
              <span className="text-c1-regular line-clamp-1 text-gray-500">{item.subtitle}</span>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

export default PopularSection
