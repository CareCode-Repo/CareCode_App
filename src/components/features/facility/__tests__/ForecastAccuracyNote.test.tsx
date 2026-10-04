import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ForecastAccuracyNote from '@/components/features/facility/ForecastAccuracyNote'
import { ForecastAccuracy } from '@/types/apis/waitlist'

/**
 * "이 확률, 믿어도 되나" 블록.
 *
 * 여기서 지켜야 할 건 하나다 — **불리한 결과를 숨기지 않는 것**. 예측이 평균으로 답하기보다 못할 때
 * 확률을 앞세우면 사용자를 틀린 쪽으로 민다. 좋은 숫자만 고르는 순간 이 블록은 광고가 되고,
 * 광고는 아무도 믿지 않는다. 나중에 "더 보기 좋게" 바꾸고 싶어지는 자리라 테스트로 묶어 둔다.
 */

const base: ForecastAccuracy = {
  measuredAt: '2026-09-28',
  horizonMonths: 6,
  samples: 320,
  facilities: 44,
  actualRate: 0.41,
  brierScore: 0.18,
  baselineBrierScore: 0.24,
  betterThanBaseline: true,
  matchedBucket: { from: 60, to: 80, samples: 45, actualTrue: 32, actualRate: 0.72 },
  calibration: [],
}

describe('ForecastAccuracyNote', () => {
  it('같은 확률대가 실제로 얼마나 맞았는지 보여준다', () => {
    render(<ForecastAccuracyNote accuracy={base} />)

    expect(screen.getByText(/비슷한 확률\(60~80%\)로 예측한 45건 중/)).toBeInTheDocument()
    expect(screen.getByText(/72%/)).toBeInTheDocument()
  })

  it('측정 근거를 함께 밝힌다', () => {
    render(<ForecastAccuracyNote accuracy={base} />)

    expect(screen.getByText(/표본 320건/)).toBeInTheDocument()
    expect(screen.getByText(/2026-09-28 측정/)).toBeInTheDocument()
  })

  it('평균으로 답하기보다 못하면 확률을 앞세우지 않는다', () => {
    render(<ForecastAccuracyNote accuracy={{ ...base, betterThanBaseline: false }} />)

    expect(screen.getByText(/평균으로 답하기.*낫지 않아요/)).toBeInTheDocument()
    // 불리할 때 유리한 구간 적중률을 같이 띄우면 결국 좋은 숫자만 남는다.
    expect(screen.queryByText(/비슷한 확률/)).not.toBeInTheDocument()
  })

  it('구간 표본이 적으면 그 구간 숫자를 만들지 않는다', () => {
    render(<ForecastAccuracyNote accuracy={{ ...base, matchedBucket: null }} />)

    expect(screen.getByText(/이 확률대는 아직 표본이 적어/)).toBeInTheDocument()
  })

  it('측정 자체가 없으면 그리지 않는다', () => {
    const { container } = render(<ForecastAccuracyNote accuracy={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('표본이 0이면 정확도라고 부르지 않는다', () => {
    const { container } = render(<ForecastAccuracyNote accuracy={{ ...base, samples: 0 }} />)

    expect(container).toBeEmptyDOMElement()
  })
})
