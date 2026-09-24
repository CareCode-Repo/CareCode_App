'use client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactElement, useMemo, useState } from 'react'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import ToggleChip from '@/components/common/ToggleChip'
import HealthRecordCard from '@/components/features/health/HealthRecordCard'
import { useMyChildren } from '@/queries/child'
import { useHealthAlerts, useHealthRecommendations, useMyHealthRecords } from '@/queries/health'
import { RECORD_TYPE_LABEL, RecordType } from '@/types/apis/health'
import { formatDate } from '@/utils/date'

/** HIGH 부터 위로. 마감이 지난 접종을 아래에 두면 못 본다. */
const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

const PRIORITY_STYLE: Record<string, string> = {
  HIGH: 'border-red bg-red/5',
  MEDIUM: 'border-yellow bg-yellow/10',
  LOW: 'border-gray-300 bg-gray-50',
}

/**
 * 예방접종·검진 임박 알림.
 *
 * 알림함(푸시)으로도 나가지만 그건 놓치면 끝이다. 기록 화면에 들어온 사람에게는
 * 지금 챙겨야 할 것을 맨 위에서 다시 보여준다. 없으면 아무것도 그리지 않는다.
 */
const HealthAlertSection = (): ReactElement | null => {
  const { data: alerts = [], isLoading } = useHealthAlerts()

  if (isLoading || !alerts.length) return null

  const sorted = [...alerts].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority ?? 'LOW'] ?? 2) - (PRIORITY_ORDER[b.priority ?? 'LOW'] ?? 2),
  )

  return (
    <section className="flex flex-col gap-2 pb-5">
      <h2 className="text-b1-semibold text-gray-800">챙길 일정</h2>
      <ul className="flex flex-col gap-2">
        {sorted.map((alert, index) => (
          <li
            key={alert.alertId ?? `${alert.title}-${index}`}
            className={clsx(
              'flex flex-col gap-1 rounded-lg border p-3',
              PRIORITY_STYLE[alert.priority ?? 'LOW'] ?? PRIORITY_STYLE.LOW,
            )}
          >
            <span className="text-b1-semibold text-gray-800">{alert.title ?? '알림'}</span>
            {alert.message && (
              <span className="text-b2-regular text-gray-700">{alert.message}</span>
            )}
            {alert.dueDate && (
              <span className="text-c1-regular text-gray-500">
                {formatDate(alert.dueDate)} 예정
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * 아이 월령 기준 넛지.
 *
 * 서버는 추천 정책·시설을 **이름 문자열로만** 준다(id 가 없다). 상세로 바로 보낼 수 없으므로
 * 검색 지름길로 쓴다 — 없는 링크를 만들어 404 로 보내는 것보다 낫다.
 */
const HealthRecommendationSection = (): ReactElement | null => {
  const router = useRouter()
  const { data } = useHealthRecommendations()

  const policies = data?.recommendedPolicies ?? []
  if (!data?.nudgeMessage && !policies.length) return null

  return (
    <section className="mb-5 flex flex-col gap-2 rounded-lg border border-green-300 bg-green-50 p-3.5">
      {data?.nudgeMessage && (
        <span className="text-b1-semibold text-gray-800">{data.nudgeMessage}</span>
      )}
      {policies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {policies.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => router.push(`/search/policy?keyword=${encodeURIComponent(name)}`)}
              className="text-c1-regular rounded-full border border-green-600 bg-white px-3 py-1 text-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

const HealthPage = (): ReactElement => {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<RecordType | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  const { data: records, isLoading, isError, refetch } = useMyHealthRecords()
  const { data: children = [] } = useMyChildren()

  // 서버에 아이/타입 동시 필터가 없어 클라이언트에서 걸러낸다 (기록 수가 많지 않은 화면).
  const filtered = useMemo(() => {
    if (!records) return []
    return records.filter(
      (record) =>
        (!selectedType || record.recordType === selectedType) &&
        (!selectedChildId || record.childId === selectedChildId),
    )
  }, [records, selectedType, selectedChildId])

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="건강 기록" contentClassName="px-4.5 py-5">
        <HealthAlertSection />
        <HealthRecommendationSection />

        {children.length > 1 && (
          <>
            <div className="scrollbar-hide flex gap-2.5 overflow-x-auto [&>*]:shrink-0">
              {children.map((child) => (
                <ToggleChip
                  key={child.id}
                  pressed={selectedChildId === String(child.id)}
                  onPressedChange={(pressed) =>
                    setSelectedChildId(pressed ? String(child.id) : null)
                  }
                >
                  {child.name}
                </ToggleChip>
              ))}
            </div>
            <Spacer className="h-3 shrink-0" />
          </>
        )}

        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto [&>*]:shrink-0">
          {(Object.keys(RECORD_TYPE_LABEL) as RecordType[]).map((type) => (
            <ToggleChip
              key={type}
              pressed={selectedType === type}
              onPressedChange={(pressed) => setSelectedType(pressed ? type : null)}
            >
              {RECORD_TYPE_LABEL[type]}
            </ToggleChip>
          ))}
        </div>

        <Spacer className="h-5 shrink-0" />

        {isLoading ? (
          <ul className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </ul>
        ) : isError ? (
          <ErrorView content="건강 기록을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : !children.length ? (
          <EmptyState
            title="먼저 아이를 등록해주세요"
            description={'건강 기록은 아이별로 저장돼요.'}
            actionLabel="아이 등록하기"
            onAction={() => router.push('/children/new')}
          />
        ) : !filtered.length ? (
          <EmptyState
            title={records?.length ? '조건에 맞는 기록이 없어요' : '아직 건강 기록이 없어요'}
            description={
              records?.length
                ? '필터를 해제해보세요.'
                : '검진 결과나 키·몸무게를 남기면\n성장 곡선에서 함께 볼 수 있어요.'
            }
            actionLabel={records?.length ? undefined : '기록 추가하기'}
            onAction={records?.length ? undefined : () => router.push('/health/new')}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((record) => (
              <li key={record.id}>
                <HealthRecordCard
                  record={record}
                  onClick={() => router.push(`/health/${record.id}`)}
                />
              </li>
            ))}
          </ul>
        )}

        {children.length > 0 && (
          <Button
            color="green"
            size="small"
            className="mt-5"
            onClick={() => router.push('/health/new')}
          >
            기록 추가하기
          </Button>
        )}
      </Layout>
    </AuthGuard>
  )
}

export default HealthPage
