'use client'
import clsx from 'clsx'
import { ReactElement } from 'react'
import Chip from '@/components/common/Chip'
import { useAdmissionForecast, useFacilityPopularity, useWaitlistStats } from '@/queries/waitlist'
import { CONFIDENCE_LABEL, DEMAND_LEVEL_LABEL, TREND_LABEL } from '@/types/apis/waitlist'

interface AdmissionInsightProps {
  facilityId: number
  /** 아이 월령. 반 편성이 달라 예측이 바뀐다. */
  childAgeMonths?: number
}

/** 대기 일수를 개월로 바꿔 체감에 맞춘다. */
const formatWaitDays = (days?: number | null): string => {
  if (days == null) return '-'
  if (days < 30) return `${days}일`
  const months = Math.round((days / 30) * 10) / 10
  return `약 ${months}개월`
}

/**
 * 입소 가능성 안내.
 *
 * 표본이 모자라면 서버가 available=false 로 알려준다. 그때 숫자를 지어내지 않고
 * "왜 아직 알 수 없는지" 를 그대로 보여준다 — 근거 없는 확률이 가장 해롭다.
 */
const AdmissionInsight = ({ facilityId, childAgeMonths }: AdmissionInsightProps): ReactElement => {
  const { data: forecast, isLoading: isForecastLoading } = useAdmissionForecast(facilityId, {
    childAgeMonths,
  })
  const { data: stats, isLoading: isStatsLoading } = useWaitlistStats(facilityId)
  const { data: popularity } = useFacilityPopularity(facilityId)

  const isLoading = isForecastLoading || isStatsLoading

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-b1-semibold text-gray-800">입소 가능성</h2>

      {/* 예측 */}
      {forecast?.available && forecast.probability != null ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-h2-bold text-green-800">{`${forecast.probability}%`}</span>
            <span className="text-b2-regular text-gray-600">
              {forecast.targetDate ? `${forecast.targetDate}까지 자리가 날 확률` : '자리가 날 확률'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {forecast.targetClass && <Chip color="white">{forecast.targetClass}</Chip>}
            {forecast.confidence && (
              <Chip color={forecast.confidence === 'HIGH' ? 'green' : 'yellow'}>
                {`신뢰도 ${CONFIDENCE_LABEL[forecast.confidence] ?? forecast.confidence}`}
              </Chip>
            )}
            <span className="text-c1-regular text-gray-500">
              {`${forecast.observationDays}일 / ${forecast.observationCount}회 관측`}
            </span>
          </div>

          {!!forecast.reasons.length && (
            <ul className="text-c1-regular flex flex-col gap-0.5 text-gray-600">
              {forecast.reasons.map((reason) => (
                <li key={reason}>{`· ${reason}`}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-b2-regular text-gray-600">
          {forecast?.unavailableReason ?? '아직 예측할 만큼 관측 데이터가 모이지 않았어요.'}
        </p>
      )}

      {/* 실제 대기 기록 — 예측과 달리 사람이 남긴 실측이다 */}
      <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-b2-semibold text-gray-700">실제 대기 기간</span>
          {stats && stats.currentlyWaiting > 0 && (
            <span className="text-c1-regular text-gray-600">
              {`현재 대기 ${stats.currentlyWaiting}명`}
            </span>
          )}
        </div>

        {stats?.available ? (
          <>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-c1-regular text-gray-500">중앙값</span>
                <span className="text-t2-semibold text-gray-900">
                  {formatWaitDays(stats.medianWaitDays)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-c1-regular text-gray-500">평균</span>
                <span className="text-b1-medium text-gray-700">
                  {formatWaitDays(stats.averageWaitDays)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-c1-regular text-gray-500">최대</span>
                <span className="text-b1-medium text-gray-700">
                  {formatWaitDays(stats.maxWaitDays)}
                </span>
              </div>
            </div>
            <span className="text-c1-regular text-gray-500">
              {`입소까지 간 ${stats.admittedSamples}건 기준`}
            </span>
          </>
        ) : (
          <p className="text-b2-regular text-gray-600">
            {stats?.unavailableReason ?? '아직 입소 기록이 모이지 않았어요.'}
          </p>
        )}
      </div>

      {/* 인기도 */}
      {popularity?.available && (
        <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-b2-semibold text-gray-700">충원율</span>
            {popularity.demandLevel && (
              <Chip color={popularity.demandLevel === 'IN_DEMAND' ? 'red' : 'white'}>
                {DEMAND_LEVEL_LABEL[popularity.demandLevel] ?? popularity.demandLevel}
              </Chip>
            )}
            {popularity.trend && (
              <span className="text-c1-regular text-gray-600">
                {TREND_LABEL[popularity.trend] ?? popularity.trend}
              </span>
            )}
          </div>

          {popularity.latestFillRate != null && (
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={clsx(
                    'h-full rounded-full',
                    popularity.latestFillRate >= 95 ? 'bg-red' : 'bg-green-500',
                  )}
                  style={{ width: `${Math.min(100, popularity.latestFillRate)}%` }}
                />
              </div>
              <span className="text-b2-regular shrink-0 text-gray-700">
                {`${popularity.latestFillRate}%`}
              </span>
            </div>
          )}

          {/* 급락은 운영 변화 신호일 수 있어 따로 알린다 */}
          {!!popularity.sharpDropDates.length && (
            <p className="text-c1-regular text-gray-600">
              {`충원율이 크게 떨어진 시점이 있어요 (${popularity.sharpDropDates.join(', ')}). 방문 시 확인해보세요.`}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default AdmissionInsight
