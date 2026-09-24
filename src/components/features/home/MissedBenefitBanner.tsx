'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import { getAccessToken } from '@/apis/auth'
import { useMissedBenefits } from '@/queries/policy'
import { formatAmount } from '@/utils/money'

/**
 * 홈 상단에서 "받을 수 있는 돈이 있다" 를 알리는 배너.
 *
 * 놓친 지원금은 사용자가 찾아 들어오는 기능이 아니라 먼저 알려줘야 하는 정보라
 * 홈에 노출한다. 받을 게 없거나 비로그인이면 자리만 차지하므로 그리지 않는다.
 */
const MissedBenefitBanner = (): ReactElement | null => {
  const router = useRouter()
  const { data, isLoading } = useMissedBenefits()

  if (!getAccessToken() || isLoading) return null
  if (!data || data.claimableCount === 0) return null

  return (
    <button
      type="button"
      onClick={() => router.push('/benefits/missed')}
      className="flex w-full items-center justify-between gap-3 rounded-lg bg-green-600 p-4 text-left transition-colors hover:bg-green-700"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-b2-regular text-green-50">아직 신청할 수 있어요</span>
        <span className="text-t1-semibold text-white">{formatAmount(data.claimableAmount)}</span>
        <span className="text-c1-regular text-green-50">
          {`소급 신청 가능 ${data.claimableCount}건`}
        </span>
      </div>
      <span className="text-b1-semibold shrink-0 text-white" aria-hidden>
        확인하기
      </span>
    </button>
  )
}

export default MissedBenefitBanner
