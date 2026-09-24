'use client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import { usePolicyVerificationStatus } from '@/queries/admin'

/** 검증률이 이 아래인 지역은 금액을 확정으로 노출하기 어렵다. */
const LOW_COVERAGE_RATE = 50

const AdminPolicyVerificationPage = (): ReactElement => {
  const router = useRouter()
  const { data: rows = [], isLoading, isError, refetch } = usePolicyVerificationStatus()

  const totalUnverified = rows.reduce((sum, row) => sum + row.unverified, 0)

  if (isError) {
    return <ErrorView content="검증 현황을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg bg-gray-100 p-4">
        <p className="text-b1-regular text-gray-700">아직 사람이 확인하지 않은 정책</p>
        <p className="text-h3-bold pt-1 text-gray-900">
          {isLoading ? '-' : `${totalUnverified.toLocaleString('ko-KR')}건`}
        </p>
        <p className="text-c1-regular pt-1 text-gray-600">
          미검증 금액은 사용자 화면에 &quot;추정 금액&quot; 으로 표기돼요. 검증률이 낮은 지역부터
          확인하는 게 효율적이에요.
        </p>
        <button
          type="button"
          onClick={() => router.push('/admin/policies/manage')}
          className="text-b2-semibold pt-3 text-green-700 underline"
        >
          정책 등록·수정하러 가기
        </button>
      </section>

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !rows.length ? (
        <EmptyState
          title="검증 대상 지역이 없어요"
          description="활성 정책에 지역 정보가 채워지면 여기에 표시돼요."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const isLow = row.verifiedRate < LOW_COVERAGE_RATE

            return (
              <li
                key={row.region}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-b1-semibold truncate text-gray-800">{row.region}</span>
                  <span
                    className={clsx(
                      'text-b1-semibold shrink-0',
                      isLow ? 'text-red' : 'text-green-700',
                    )}
                  >
                    {`${row.verifiedRate}%`}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={clsx('h-full rounded-full', isLow ? 'bg-red' : 'bg-green-500')}
                    style={{ width: `${row.verifiedRate}%` }}
                  />
                </div>

                <span className="text-c1-regular text-gray-600">
                  {`전체 ${row.total}건 · 검증 ${row.verified}건 · 미검증 ${row.unverified}건`}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AdminPolicyVerificationPage
