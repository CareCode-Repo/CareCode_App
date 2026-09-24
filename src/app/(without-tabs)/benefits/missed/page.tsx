'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import AuthGuard from '@/components/common/AuthGuard'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Separator from '@/components/common/Separator'
import MissedBenefitCard from '@/components/features/policy/MissedBenefitCard'
import { useMyChildren } from '@/queries/child'
import { useMissedBenefits } from '@/queries/policy'
import { formatAmount } from '@/utils/money'

const MissedBenefitsPage = (): ReactElement => {
  const router = useRouter()
  const { data: summary, isLoading, isError, refetch } = useMissedBenefits()
  const { data: children = [], isLoading: isChildrenLoading } = useMyChildren()

  const hasAnything = !!summary && (summary.claimable.length > 0 || summary.expired.length > 0)

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="놓친 지원금" contentClassName="pb-8">
        {isLoading || isChildrenLoading ? (
          <div className="flex flex-col gap-3 p-4.5">
            <div className="h-28 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-40 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ) : isError ? (
          <ErrorView content="지원금 정보를 불러오지 못했어요." onRetry={() => refetch()} />
        ) : !children.length ? (
          <EmptyState
            title="먼저 아이를 등록해주세요"
            description={'아이의 생년월일을 알아야\n받을 수 있었던 지원금을 찾을 수 있어요.'}
            actionLabel="아이 등록하기"
            onAction={() => router.push('/children/new')}
          />
        ) : (
          <>
            {/* 요약 — 이 화면의 결론을 맨 위에서 한 번에 전한다 */}
            <section className="bg-green-50 px-4.5 py-6">
              {summary!.claimableCount > 0 ? (
                <>
                  <p className="text-b1-regular text-gray-700">지금 신청하면 받을 수 있어요</p>
                  <p className="text-h1-bold pt-1 text-green-900">
                    {formatAmount(summary!.claimableAmount)}
                  </p>
                  <p className="text-b2-regular pt-1 text-gray-700">
                    {`소급 신청 가능 ${summary!.claimableCount}건`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-t1-semibold text-green-900">놓친 지원금이 없어요</p>
                  <p className="text-b2-regular pt-1 text-gray-700">
                    받을 수 있는 지원금을 잘 챙기고 계세요.
                  </p>
                </>
              )}

              {summary!.unknownEligibilityCount > 0 && (
                <p className="text-c1-regular pt-3 text-gray-600">
                  {`소득 정보가 없어 판정을 보류한 ${summary!.unknownEligibilityCount}건이 있어요. 실제로는 더 받을 수 있습니다.`}
                </p>
              )}
            </section>

            {summary!.claimable.length > 0 && (
              <section className="flex flex-col gap-3 px-4.5 py-5">
                <h2 className="text-b1-semibold text-gray-800">
                  {`아직 신청할 수 있어요 (${summary!.claimable.length})`}
                </h2>
                {summary!.claimable.map((benefit) => (
                  <MissedBenefitCard
                    key={`${benefit.policyId}-${benefit.childName ?? ''}`}
                    benefit={benefit}
                    onDetailClick={() => router.push(`/policy/${benefit.policyId}`)}
                  />
                ))}
              </section>
            )}

            {summary!.expired.length > 0 && (
              <>
                <Separator />
                <section className="flex flex-col gap-3 px-4.5 py-5">
                  <h2 className="text-b1-semibold text-gray-800">
                    {`신청 기간이 지났어요 (${summary!.expiredCount})`}
                  </h2>
                  <p className="text-b2-regular text-gray-600">
                    다음에는 놓치지 않도록 알림을 켜두시는 걸 권해요.
                  </p>
                  {summary!.expired.map((benefit) => (
                    <MissedBenefitCard
                      key={`${benefit.policyId}-${benefit.childName ?? ''}`}
                      benefit={benefit}
                      onDetailClick={() => router.push(`/policy/${benefit.policyId}`)}
                    />
                  ))}
                </section>
              </>
            )}

            {!hasAnything && (
              <EmptyState
                title="확인된 누락 지원금이 없어요"
                description={'아이 정보와 거주지를 채워두면\n더 정확하게 찾아드릴 수 있어요.'}
                actionLabel="내 정보 확인하기"
                onAction={() => router.push('/mypage/edit')}
              />
            )}
          </>
        )}
      </Layout>
    </AuthGuard>
  )
}

export default MissedBenefitsPage
