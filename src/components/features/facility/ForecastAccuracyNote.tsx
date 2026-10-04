'use client'

import { ReactElement } from 'react'
import { ForecastAccuracy } from '@/types/apis/waitlist'

interface ForecastAccuracyNoteProps {
  accuracy?: ForecastAccuracy | null
  /** 지금 화면에 띄운 확률. 그 확률이 속한 구간의 실제 적중률을 서버가 골라 준다. */
  className?: string
}

const percent = (rate?: number | null): string | null =>
  rate == null ? null : `${Math.round(rate * 100)}%`

/**
 * "이 확률, 믿어도 되나" 에 답하는 한 블록.
 *
 * 확률을 보여주는 서비스는 많지만 자기 확률이 과거에 얼마나 맞았는지를 같이 내놓는 곳은 드물다.
 * 측정하는 쪽만 할 수 있는 말이고, 그래서 흉내 내기 어렵다. 틀렸다는 사실까지 적는 이유다 —
 * 좋은 숫자만 고르면 그 순간 이 블록은 광고가 되고, 광고는 아무도 믿지 않는다.
 */
const ForecastAccuracyNote = ({
  accuracy,
  className = '',
}: ForecastAccuracyNoteProps): ReactElement | null => {
  if (!accuracy || accuracy.samples === 0) return null

  const bucket = accuracy.matchedBucket
  const bucketRate = percent(bucket?.actualRate)

  return (
    <div className={`border-t border-gray-200 pt-3 ${className}`}>
      <p className="text-b2-semibold text-gray-800">이 확률이 과거에 맞은 정도</p>

      {/*
        평균으로 답하기(기준선)보다 못하면 확률을 강조하지 않는다. 서버가 betterThanBaseline 으로
        그 판단을 이미 내려 준다. 못한데도 숫자를 앞세우면 사용자를 틀린 쪽으로 밀게 된다.
      */}
      {accuracy.betterThanBaseline ? (
        <>
          {bucket && bucketRate ? (
            <p className="text-b2-regular mt-1 text-gray-700">
              {`비슷한 확률(${bucket.from}~${bucket.to}%)로 예측한 ${bucket.samples}건 중 실제로 자리가 난 건 ${bucketRate}였어요.`}
            </p>
          ) : (
            <p className="text-b2-regular mt-1 text-gray-700">
              {`전체 예측 ${accuracy.samples}건으로 측정했어요. 이 확률대는 아직 표본이 적어 따로 보여주지 않아요.`}
            </p>
          )}
        </>
      ) : (
        <p className="text-b2-regular mt-1 text-gray-700">
          아직 이 예측은 &ldquo;평균으로 답하기&rdquo;보다 낫지 않아요. 참고용으로만 봐주세요.
        </p>
      )}

      <p className="text-c1-regular mt-1 text-gray-700">
        {[
          `${accuracy.horizonMonths}개월 예측`,
          `표본 ${accuracy.samples}건`,
          accuracy.facilities > 0 ? `시설 ${accuracy.facilities}곳` : null,
          accuracy.measuredAt ? `${accuracy.measuredAt} 측정` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </div>
  )
}

export default ForecastAccuracyNote
