'use client'
import { ReactElement, useState } from 'react'
import ErrorView from '@/components/common/Error'
import Separator from '@/components/common/Separator'
import ToggleChip from '@/components/common/ToggleChip'
import FunnelChart from '@/components/features/admin/FunnelChart'
import { useEventCounts, useFunnel, useRetention } from '@/queries/admin'
import { EVENT_LABEL } from '@/types/apis/admin'
import { formatDate } from '@/utils/date'

const RANGE_OPTIONS = [7, 30, 90]

/** yyyy-MM-dd. 서버가 ISO DATE 로 받는다. */
const toDateParam = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

const AdminAnalyticsPage = (): ReactElement => {
  const [rangeDays, setRangeDays] = useState(30)
  const query = { from: toDateParam(rangeDays), to: toDateParam(0) }

  const { data: funnel, isLoading: isFunnelLoading, isError, refetch } = useFunnel(query)
  const { data: retention, isLoading: isRetentionLoading } = useRetention(query)
  const { data: events, isLoading: isEventsLoading } = useEventCounts(query)

  const sortedEvents = Object.entries(events ?? {}).sort(([, a], [, b]) => b - a)

  if (isError) {
    return <ErrorView content="지표를 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {RANGE_OPTIONS.map((option) => (
          <ToggleChip
            key={option}
            pressed={rangeDays === option}
            onPressedChange={() => setRangeDays(option)}
          >
            {`최근 ${option}일`}
          </ToggleChip>
        ))}
      </div>

      {/* 퍼널 — 어디서 이탈하는지가 이 화면의 핵심 질문이다 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-b1-semibold text-gray-800">온보딩 퍼널</h2>
        {isFunnelLoading ? (
          <div className="h-40 animate-pulse rounded-lg bg-gray-200" />
        ) : !funnel?.steps.length ? (
          <p className="text-b2-regular text-gray-600">아직 집계된 이벤트가 없어요.</p>
        ) : (
          <FunnelChart steps={funnel.steps} />
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-b1-semibold text-gray-800">코호트 리텐션</h2>
        {isRetentionLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
        ) : !retention?.cohorts.length ? (
          <p className="text-b2-regular text-gray-600">표시할 코호트가 없어요.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse">
              <thead>
                <tr className="text-c1-regular text-gray-600">
                  <th className="px-2 py-2 text-left font-normal">가입일</th>
                  <th className="px-2 py-2 text-right font-normal">가입</th>
                  <th className="px-2 py-2 text-right font-normal">D1</th>
                  <th className="px-2 py-2 text-right font-normal">D7</th>
                  <th className="px-2 py-2 text-right font-normal">D30</th>
                </tr>
              </thead>
              <tbody>
                {retention.cohorts.map((cohort) => (
                  <tr key={cohort.signUpDate} className="border-t border-gray-200">
                    <td className="text-b2-regular px-2 py-2 text-gray-800">
                      {formatDate(cohort.signUpDate, 'MM.dd')}
                    </td>
                    <td className="text-b2-regular px-2 py-2 text-right text-gray-800">
                      {cohort.signedUp.toLocaleString('ko-KR')}
                    </td>
                    {/* 아직 그날이 오지 않은 칸은 0% 가 아니라 빈칸이어야 한다 */}
                    {[cohort.day1, cohort.day7, cohort.day30].map((rate, index) => (
                      <td
                        key={index}
                        className="text-b2-regular px-2 py-2 text-right text-gray-700"
                      >
                        {rate == null ? '-' : `${rate}%`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-b1-semibold text-gray-800">이벤트 발생 건수</h2>
        {isEventsLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ) : !sortedEvents.length ? (
          <p className="text-b2-regular text-gray-600">집계된 이벤트가 없어요.</p>
        ) : (
          <ul className="flex flex-col rounded-lg border border-gray-200 bg-white">
            {sortedEvents.map(([event, count]) => (
              <li
                key={event}
                className="flex items-center justify-between border-b border-gray-200 px-4 py-3 last:border-b-0"
              >
                <span className="text-b1-regular truncate text-gray-800">
                  {EVENT_LABEL[event] ?? event}
                </span>
                <span className="text-b1-semibold shrink-0 text-gray-900">
                  {count.toLocaleString('ko-KR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default AdminAnalyticsPage
