import { ReactElement } from 'react'
import Chip from '@/components/common/Chip'
import { PersonalizedPolicy } from '@/types/apis/policy'
import { formatAmount } from '@/utils/money'

interface RecommendedPolicyCardProps {
  recommendation: PersonalizedPolicy
  onClick?: () => void
}

const RecommendedPolicyCard = ({
  recommendation,
  onClick,
}: RecommendedPolicyCardProps): ReactElement => {
  const { policy, reasons } = recommendation

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-2">
        {policy.category && <Chip color="green">{policy.category}</Chip>}
        <span className="text-b1-semibold truncate text-gray-800">{policy.title}</span>
      </div>

      <span className="text-t2-semibold text-gray-900">{formatAmount(policy.supportAmount)}</span>

      {/* 추천 근거. 왜 나왔는지 모르면 추천을 믿지 않는다. */}
      {!!reasons?.length && (
        <ul className="flex flex-wrap gap-1.5">
          {reasons.map((reason) => (
            <li
              key={reason}
              className="text-c1-regular rounded-full bg-green-50 px-2 py-0.5 text-green-800"
            >
              {reason}
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}

export default RecommendedPolicyCard
