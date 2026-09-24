'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import { getAccessToken } from '@/apis/auth'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import { useBenefitAmountConsensus, useReportBenefitAmount } from '@/queries/policy'
import { PAYMENT_TYPE_LABEL, PaymentType } from '@/types/apis/policy'
import { formatAmount } from '@/utils/money'

interface BenefitAmountReportProps {
  policyId: number
}

/**
 * 실수령액 제보.
 *
 * 공공데이터의 금액은 비어 있거나 추정치인 경우가 많다. 실제로 받은 사람들이 같은 금액을
 * 여러 번 알려주면 그 값이 확정된다. "몇 명 더 필요한지" 를 보여줘야 참여가 이어진다.
 */
const BenefitAmountReport = ({ policyId }: BenefitAmountReportProps): ReactElement => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType>('ONE_TIME')

  const { data: consensus, isLoading } = useBenefitAmountConsensus(policyId)
  const { mutate: report, isPending, isError } = useReportBenefitAmount(policyId)

  const parsedAmount = Number(amount)
  const canSubmit =
    amount !== '' && Number.isFinite(parsedAmount) && parsedAmount >= 0 && !isPending

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return

    if (!getAccessToken()) {
      router.push('/')
      return
    }

    report(
      { amount: parsedAmount, paymentType },
      {
        onSuccess: () => {
          setIsOpen(false)
          setAmount('')
        },
      },
    )
  }

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-b1-semibold text-gray-800">실수령액</h2>
        {consensus?.confirmed ? (
          <Chip color="green">확정</Chip>
        ) : (
          <Chip color="yellow">확인 중</Chip>
        )}
      </div>

      {consensus?.confirmed && consensus.consensusAmount != null ? (
        <p className="text-t2-semibold text-gray-900">
          {formatAmount(consensus.consensusAmount)}
          {consensus.consensusPaymentType && (
            <span className="text-b2-regular pl-2 text-gray-600">
              {PAYMENT_TYPE_LABEL[consensus.consensusPaymentType as PaymentType] ??
                consensus.consensusPaymentType}
            </span>
          )}
        </p>
      ) : (
        <p className="text-b2-regular text-gray-600">
          {consensus && consensus.totalReports > 0
            ? `제보 ${consensus.totalReports}건 · 확정까지 ${consensus.remainingForConsensus}명 남았어요`
            : '아직 제보가 없어요. 받으신 금액을 알려주시면 다른 부모님께 도움이 돼요.'}
        </p>
      )}

      {!isOpen ? (
        <Button color="gray" size="small" onClick={() => setIsOpen(true)}>
          받은 금액 알려주기
        </Button>
      ) : (
        <form className="flex flex-col gap-3 border-t border-gray-200 pt-3" onSubmit={handleSubmit}>
          <Input
            label="받은 금액 (원)"
            required
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={setAmount}
            placeholder="예: 2000000"
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="text-b1-semibold text-gray-800">지급 방식</legend>
            <div className="flex gap-2 pt-2">
              {(Object.keys(PAYMENT_TYPE_LABEL) as PaymentType[]).map((type) => (
                <ToggleChip
                  key={type}
                  pressed={paymentType === type}
                  onPressedChange={() => setPaymentType(type)}
                >
                  {PAYMENT_TYPE_LABEL[type]}
                </ToggleChip>
              ))}
            </div>
          </fieldset>

          {isError && (
            <p className="text-red text-b2-regular" role="alert">
              제보에 실패했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}

          <div className="flex gap-2">
            <Button type="button" color="gray" size="small" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button type="submit" color="green" size="small" disabled={!canSubmit}>
              {isPending ? '보내는 중...' : '제보하기'}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

export default BenefitAmountReport
