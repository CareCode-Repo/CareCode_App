import clsx from 'clsx'
import { ReactElement } from 'react'
import { getPolicyApplyUrl } from '@/apis/policy'
import Chip from '@/components/common/Chip'
import { MissedBenefit } from '@/types/apis/policy'
import { formatAmount, formatMonths } from '@/utils/money'

interface MissedBenefitCardProps {
  benefit: MissedBenefit
  onDetailClick?: () => void
}

const MissedBenefitCard = ({ benefit, onDetailClick }: MissedBenefitCardProps): ReactElement => {
  const period =
    benefit.eligibleFromMonth != null && benefit.eligibleToMonth != null
      ? `${formatMonths(benefit.eligibleFromMonth)}~${formatMonths(benefit.eligibleToMonth)} 대상`
      : null

  // 마감이 코앞이면 강조한다. 이 화면은 "지금 신청하면 받는다" 를 전달하는 게 목적이다.
  const isUrgent =
    benefit.claimable && benefit.remainingMonths != null && benefit.remainingMonths <= 3

  return (
    <article
      className={clsx(
        'flex flex-col gap-2 rounded-lg border bg-white p-4',
        isUrgent ? 'border-red' : 'border-gray-200',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onDetailClick}
          className="text-b1-semibold min-w-0 flex-1 truncate text-left text-gray-800"
        >
          {benefit.title}
        </button>
        {benefit.claimable ? (
          <Chip color={isUrgent ? 'red' : 'green'}>
            {benefit.remainingMonths != null ? `${benefit.remainingMonths}개월 남음` : '신청 가능'}
          </Chip>
        ) : (
          <Chip color="white">기간 종료</Chip>
        )}
      </div>

      <p className="text-h3-bold text-gray-900">{formatAmount(benefit.benefitAmount)}</p>

      <div className="text-b2-regular flex flex-wrap items-center gap-2 text-gray-600">
        {benefit.childName && <span>{benefit.childName}</span>}
        {benefit.childName && period && <span aria-hidden>·</span>}
        {period && <span>{period}</span>}
      </div>

      {!!benefit.reasons?.length && (
        <ul className="text-c1-regular flex flex-col gap-0.5 text-gray-600">
          {benefit.reasons.map((reason) => (
            <li key={reason}>{`· ${reason}`}</li>
          ))}
        </ul>
      )}

      {benefit.claimable && (
        <a
          href={getPolicyApplyUrl(benefit.policyId)}
          target="_blank"
          rel="noreferrer"
          className="text-b1-semibold mt-1 rounded-lg bg-green-600 py-2.5 text-center text-white transition-colors hover:bg-green-700"
        >
          지금 신청하기
        </a>
      )}
    </article>
  )
}

export default MissedBenefitCard
