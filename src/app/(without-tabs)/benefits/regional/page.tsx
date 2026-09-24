'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useMemo, useState } from 'react'
import AuthGuard from '@/components/common/AuthGuard'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import ToggleChip from '@/components/common/ToggleChip'
import RegionalBenefitRow from '@/components/features/policy/RegionalBenefitRow'
import { useMyChildren } from '@/queries/child'
import { useRegionalComparison } from '@/queries/policy'
import { DATA_QUALITY_LABEL } from '@/types/apis/policy'
import { formatAmount } from '@/utils/money'

const HORIZON_OPTIONS = [3, 5, 10]

const RegionalBenefitsPage = (): ReactElement => {
  const router = useRouter()
  const [years, setYears] = useState(5)

  const { data: children = [] } = useMyChildren()
  const { data, isLoading, isError, refetch } = useRegionalComparison({ years, limit: 10 })

  const maxAmount = useMemo(
    () => data?.rankings.reduce((max, item) => Math.max(max, item.totalAmount), 0) ?? 0,
    [data],
  )

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="지역별 지원금 비교" contentClassName="pb-8">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4.5">
            <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : isError ? (
          <ErrorView content="비교 정보를 불러오지 못했어요." onRetry={() => refetch()} />
        ) : !children.length ? (
          <EmptyState
            title="먼저 아이를 등록해주세요"
            description={'아이의 월령에 따라 받을 수 있는\n지원금이 달라져요.'}
            actionLabel="아이 등록하기"
            onAction={() => router.push('/children/new')}
          />
        ) : (
          <>
            <section className="bg-gray-100 px-4.5 py-5">
              <p className="text-b1-regular text-gray-700">
                {data?.childName
                  ? `${data.childName}이(가) 앞으로 ${Math.round((data.horizonMonths || 0) / 12)}년간 받을 지원금`
                  : '앞으로 받을 지원금을 지역별로 비교했어요'}
              </p>

              {data?.baseRegion ? (
                <p className="text-h3-bold pt-1 text-gray-900">
                  {`${data.baseRegion} ${formatAmount(data.baseAmount)}`}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/mypage/edit')}
                  className="text-b1-semibold pt-1 text-green-700 underline"
                >
                  거주지를 입력하면 내 지역과 비교할 수 있어요
                </button>
              )}

              <div className="flex gap-2 pt-4">
                {HORIZON_OPTIONS.map((option) => (
                  <ToggleChip
                    key={option}
                    pressed={years === option}
                    onPressedChange={() => setYears(option)}
                  >
                    {`${option}년`}
                  </ToggleChip>
                ))}
              </div>
            </section>

            {!data?.rankings.length ? (
              <EmptyState
                title="비교할 지역 데이터가 없어요"
                description="지자체 정책 수집이 끝나면 다시 확인해주세요."
              />
            ) : (
              <ul className="flex flex-col gap-3 px-4.5 py-5">
                {data.rankings.map((benefit, index) => (
                  <RegionalBenefitRow
                    key={benefit.region}
                    benefit={benefit}
                    rank={index + 1}
                    isBase={!!data.baseRegion && benefit.region === data.baseRegion}
                    maxAmount={maxAmount}
                  />
                ))}
              </ul>
            )}

            {/* 추정치를 확정 금액처럼 보이게 두면 안 된다. 한계를 분명히 적는다. */}
            <section className="mx-4.5 flex flex-col gap-2 rounded-lg bg-gray-100 p-4">
              <p className="text-b2-semibold text-gray-700">
                {data?.dataQuality
                  ? `데이터 신뢰도: ${DATA_QUALITY_LABEL[data.dataQuality] ?? data.dataQuality}`
                  : '참고용 추정치예요'}
              </p>
              <ul className="text-c1-regular flex flex-col gap-1 text-gray-600">
                {data?.disclaimers.map((disclaimer) => (
                  <li key={disclaimer}>{`· ${disclaimer}`}</li>
                ))}
                <li>· 실제 수령액은 소득·가구 요건에 따라 달라질 수 있어요.</li>
              </ul>
            </section>
          </>
        )}
      </Layout>
    </AuthGuard>
  )
}

export default RegionalBenefitsPage
