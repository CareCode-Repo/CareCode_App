'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import { getAccessToken } from '@/apis/auth'
import { useMyChildren } from '@/queries/child'
import { useMissedBenefits } from '@/queries/policy'
import { formatAmount } from '@/utils/money'
import { routes } from '@/utils/routes'

/**
 * 홈이 사용자에게 던지는 첫 문장.
 *
 * 지원금 목록은 정부24 가 이미 더 많이 가지고 있다. 우리가 대신 답할 수 있는 건 "제도가 무엇인가" 가
 * 아니라 "당신이 지금 얼마를 놓치고 있는가" 다. 아이 생년월일과 거주지를 아는 쪽만 계산할 수 있고,
 * 그래서 이 숫자가 이 앱의 존재 이유다. 화면 맨 위에 두는 이유이기도 하다.
 *
 * 숫자는 부풀리지 않는다. 금액이 확인된 건만 더하고, 확인되지 않은 건은 따로 센다.
 * 과장된 금액은 한 번은 통하지만 두 번째부터는 앱 전체를 믿지 않게 만든다.
 */
const MissedMoneyHero = (): ReactElement | null => {
  const router = useRouter()
  const { data: children, isLoading: isChildrenLoading } = useMyChildren()
  const { data, isLoading } = useMissedBenefits()

  if (!getAccessToken()) return null

  if (isChildrenLoading || isLoading) {
    return <div className="h-40 w-full animate-pulse rounded-xl bg-gray-200" aria-hidden />
  }

  /*
    아이가 없으면 계산 자체가 불가능하다. 예전에는 여기서 아무것도 그리지 않았는데,
    그러면 앱을 처음 연 사람 — 설득이 가장 필요한 사람 — 에게 홈이 텅 빈 채로 열린다.
    계산할 수 없다는 사실을 숨기는 대신, 무엇을 해야 계산되는지 말한다.
  */
  if (!children?.length) {
    return (
      <section className="rounded-xl bg-green-600 p-5" aria-labelledby="missed-money-heading">
        <h2 id="missed-money-heading" className="text-h3-bold text-gray-900">
          놓치고 있는 지원금, 찾아드릴게요
        </h2>
        <p className="text-b1-regular mt-2 text-gray-900">
          아이 생년월일만 있으면 지금 신청할 수 있는 지원금과 이미 지나간 지원금을 계산해 드려요.
        </p>
        <button
          type="button"
          onClick={() => router.push(routes.childNew())}
          className="text-t2-semibold mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-white px-4 text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          아이 등록하고 찾아보기
        </button>
      </section>
    )
  }

  const childLabel = children.length === 1 ? `${children[0].name}이가` : '우리 아이가'

  if (!data || (data.claimableCount === 0 && data.expiredCount === 0)) {
    /*
      놓친 게 없는 것도 답이다. 빈 화면 대신 확인했다는 사실을 돌려준다.
      매번 볼 정보는 아니므로 가장 조용한 형태로 둔다.
    */
    return (
      <section
        className="rounded-xl border border-gray-200 bg-white p-5"
        aria-labelledby="missed-money-heading"
      >
        <h2 id="missed-money-heading" className="text-t1-semibold text-gray-900">
          지금 놓치고 있는 지원금은 없어요
        </h2>
        <p className="text-b1-regular mt-1 text-gray-700">
          새로운 지원금이 생기거나 마감이 다가오면 먼저 알려드릴게요.
        </p>
      </section>
    )
  }

  // 금액이 확인되지 않은 정책은 합계에서 빠져 있다. 그 사실을 숫자 옆에 적는다.
  const unpricedCount = data.claimable.filter((item) => !item.benefitAmount).length

  if (data.claimableCount === 0) {
    // 소급 신청할 수 있는 건 없지만, 같은 실수를 반복하지 않도록 지나간 건은 보여 준다.
    return (
      <section
        className="rounded-xl border border-gray-200 bg-white p-5"
        aria-labelledby="missed-money-heading"
      >
        <h2 id="missed-money-heading" className="text-t1-semibold text-gray-900">
          지금 신청할 수 있는 지원금은 없어요
        </h2>
        <p className="text-b1-regular mt-1 text-gray-700">
          {`대상 기간이 지난 ${data.expiredCount}건은 기록해 뒀어요. 다음 아이 때 같은 걸 놓치지 않도록요.`}
        </p>
        <button
          type="button"
          onClick={() => router.push(routes.missedBenefits())}
          className="text-b1-semibold mt-3 inline-flex min-h-11 items-center text-green-900 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
        >
          지나간 지원금 보기
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-xl bg-green-600 p-5" aria-labelledby="missed-money-heading">
      <h2 id="missed-money-heading" className="text-b1-regular text-gray-900">
        {`${childLabel} 지금 받을 수 있는 돈`}
      </h2>

      {/* 이 숫자 하나를 보여주려고 홈 전체를 다시 짰다. 가장 크게, 가장 위에. */}
      <p className="text-h1-bold mt-1 text-gray-900">{formatAmount(data.claimableAmount)}</p>

      <p className="text-b1-regular mt-1 text-gray-900">
        {`지금 신청할 수 있는 ${data.claimableCount}건`}
        {unpricedCount > 0 && ` (금액 확인된 ${data.claimableCount - unpricedCount}건 합계)`}
      </p>

      {data.expiredCount > 0 && (
        <p className="text-c1-regular mt-1 text-gray-900">
          {`기간이 지나 신청할 수 없게 된 ${data.expiredCount}건도 있어요.`}
        </p>
      )}

      <button
        type="button"
        onClick={() => router.push(routes.missedBenefits())}
        className="text-t2-semibold mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-white px-4 text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        확인하고 신청하기
      </button>

      {/*
        소득을 모르면 판정을 보류한 건이 생긴다. 보류했다는 사실을 숨기면 "왜 내 건 없지" 가 되고,
        그 자리에서 해결할 방법을 같이 주지 않으면 알려줘도 소용이 없다.
      */}
      {data.unknownEligibilityCount > 0 && (
        <p className="text-c1-regular mt-3 text-gray-900">
          {`소득 정보를 입력하면 ${data.unknownEligibilityCount}건을 더 정확히 판정할 수 있어요.`}
        </p>
      )}
    </section>
  )
}

export default MissedMoneyHero
