'use client'
import clsx from 'clsx'
import { ReactElement, useState } from 'react'
import Chip from '@/components/common/Chip'
import { DATA_QUALITY_LABEL, RegionalBenefit } from '@/types/apis/policy'
import { formatAmount, formatDifference } from '@/utils/money'

interface RegionalBenefitRowProps {
  benefit: RegionalBenefit
  rank: number
  /** 현재 거주지인지. 비교의 기준점이라 따로 표시한다. */
  isBase?: boolean
  /** 막대 길이 계산용 최댓값 */
  maxAmount: number
}

const RegionalBenefitRow = ({
  benefit,
  rank,
  isBase = false,
  maxAmount,
}: RegionalBenefitRowProps): ReactElement => {
  const [expanded, setExpanded] = useState(false)

  const ratio = maxAmount > 0 ? Math.max(4, (benefit.totalAmount / maxAmount) * 100) : 0
  const hasDetail = benefit.topContributors.length > 0 || benefit.nonCashPolicyCount > 0

  return (
    <li
      className={clsx(
        'flex flex-col rounded-lg border p-4',
        isBase ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white',
      )}
    >
      <button
        type="button"
        onClick={() => hasDetail && setExpanded((prev) => !prev)}
        aria-expanded={hasDetail ? expanded : undefined}
        className="flex flex-col gap-2 text-left"
        disabled={!hasDetail}
      >
        <div className="flex items-center gap-2">
          <span className="text-b2-semibold w-5 shrink-0 text-gray-500">{rank}</span>
          <span className="text-b1-semibold truncate text-gray-800">{benefit.region}</span>
          {isBase && <Chip color="green">현재 거주지</Chip>}
        </div>

        {/* 금액 막대 — 숫자만으로는 지역 간 격차가 잘 안 읽힌다 */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={clsx('h-full rounded-full', isBase ? 'bg-green-600' : 'bg-green-400')}
            style={{ width: `${ratio}%` }}
          />
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-t2-semibold text-gray-900">
            {formatAmount(benefit.totalAmount)}
          </span>
          {!isBase && (
            <span
              className={clsx(
                'text-b2-semibold',
                benefit.differenceFromBase > 0 ? 'text-green-700' : 'text-gray-500',
              )}
            >
              {formatDifference(benefit.differenceFromBase)}
            </span>
          )}
        </div>

        <div className="text-c1-regular flex flex-wrap items-center gap-2 text-gray-600">
          <span>{`현금성 ${benefit.cashPolicyCount}건`}</span>
          {benefit.nonCashPolicyCount > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{`비현금 ${benefit.nonCashPolicyCount}건`}</span>
            </>
          )}
          {benefit.dataQuality && (
            <>
              <span aria-hidden>·</span>
              <span>{DATA_QUALITY_LABEL[benefit.dataQuality] ?? benefit.dataQuality}</span>
            </>
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3">
          {benefit.topContributors.length > 0 && (
            <>
              <p className="text-b2-semibold text-gray-700">금액이 큰 정책</p>
              <ul className="flex flex-col gap-1">
                {benefit.topContributors.map((contribution) => (
                  <li
                    key={contribution.title}
                    className="text-b2-regular flex justify-between gap-2 text-gray-700"
                  >
                    <span className="truncate">{contribution.title}</span>
                    <span className="shrink-0">{formatAmount(contribution.amount)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {benefit.nonCashPolicyCount > 0 && (
            <p className="text-c1-regular text-gray-600">
              {`무료 검진·서비스 등 ${benefit.nonCashPolicyCount}건은 금액으로 환산되지 않아 합계에서 빠져 있어요.`}
            </p>
          )}
        </div>
      )}
    </li>
  )
}

export default RegionalBenefitRow
