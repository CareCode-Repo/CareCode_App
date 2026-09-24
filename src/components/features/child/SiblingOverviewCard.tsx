'use client'
import { ReactElement } from 'react'
import Chip from '@/components/common/Chip'
import { useSiblingOverview } from '@/queries/child'
import { formatDate } from '@/utils/date'

interface SiblingOverviewCardProps {
  onChildClick?: (childId: number) => void
}

/**
 * 자녀 전체를 한 화면에서 보는 요약.
 *
 * 다자녀 가구는 아이별로 화면을 다시 여는 게 가장 큰 불편이라, 다가오는 접종과 대기 현황을
 * 여기 모아 둔다. 자녀가 하나뿐이면 아래 목록과 겹치므로 그리지 않는다.
 */
const SiblingOverviewCard = ({ onChildClick }: SiblingOverviewCardProps): ReactElement | null => {
  const { data, isLoading } = useSiblingOverview()

  if (isLoading || !data || data.childCount < 2) return null

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-b1-semibold text-gray-800">{`우리 아이 ${data.childCount}명`}</h2>
        {data.multiChildHousehold && <Chip color="green">다자녀</Chip>}
      </div>

      <ul className="flex flex-col gap-2">
        {data.children.map((child) => (
          <li key={child.childId}>
            <button
              type="button"
              onClick={() => onChildClick?.(child.childId)}
              className="flex w-full flex-col gap-1 rounded-lg bg-white p-3 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-b1-medium text-gray-800">{child.name}</span>
                {child.classLabel && <Chip color="white">{child.classLabel}</Chip>}
                {child.waitlistCount > 0 && (
                  <span className="text-c1-regular text-gray-600">
                    {`대기 ${child.waitlistCount}곳`}
                  </span>
                )}
              </div>

              {child.nextVaccination ? (
                <span className="text-c1-regular text-gray-700">
                  {`다음 접종 ${child.nextVaccination}`}
                  {child.nextVaccinationDate && ` · ${formatDate(child.nextVaccinationDate)}`}
                </span>
              ) : (
                <span className="text-c1-regular text-gray-500">예정된 접종 없음</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* 자녀 수 덕분에 새로 받을 수 있게 된 정책 — 모르고 지나치기 쉬운 부분이다 */}
      {!!data.multiChildBenefits.length && (
        <div className="flex flex-col gap-1 border-t border-green-200 pt-3">
          <span className="text-b2-semibold text-gray-700">다자녀 혜택</span>
          <ul className="text-c1-regular flex flex-col gap-0.5 text-gray-700">
            {data.multiChildBenefits.map((benefit) => (
              <li key={benefit}>{`· ${benefit}`}</li>
            ))}
          </ul>
        </div>
      )}

      {!!data.notes.length && (
        <ul className="text-c1-regular flex flex-col gap-0.5 text-gray-600">
          {data.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SiblingOverviewCard
