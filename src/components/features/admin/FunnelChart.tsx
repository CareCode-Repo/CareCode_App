import clsx from 'clsx'
import { ReactElement } from 'react'
import { EVENT_LABEL, FunnelStep } from '@/types/apis/admin'

interface FunnelChartProps {
  steps: FunnelStep[]
}

/** 전환율이 이 아래면 병목으로 본다. 눈에 띄게 표시해 먼저 손보게 한다. */
const BOTTLENECK_RATE = 50

const FunnelChart = ({ steps }: FunnelChartProps): ReactElement => {
  const maxUsers = steps.reduce((max, step) => Math.max(max, step.users), 0)

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step) => {
        const ratio = maxUsers > 0 ? Math.max(2, (step.users / maxUsers) * 100) : 0
        const isBottleneck = step.conversionRate != null && step.conversionRate < BOTTLENECK_RATE

        return (
          <li key={step.event} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-b1-medium truncate text-gray-800">
                {step.label ?? EVENT_LABEL[step.event] ?? step.event}
              </span>
              <span className="text-b2-regular shrink-0 text-gray-600">
                {`${step.users.toLocaleString('ko-KR')}명`}
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={clsx('h-full rounded-full', isBottleneck ? 'bg-red' : 'bg-green-500')}
                style={{ width: `${ratio}%` }}
              />
            </div>

            {step.conversionRate != null && (
              <span
                className={clsx('text-c1-regular', isBottleneck ? 'text-red' : 'text-gray-600')}
              >
                {`직전 단계 대비 ${step.conversionRate}%`}
                {isBottleneck && ' · 이탈이 큰 구간'}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default FunnelChart
