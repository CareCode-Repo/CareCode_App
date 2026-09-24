import { ReactElement, useId } from 'react'
import { GROWTH_METRIC_LABEL, GrowthMetric, GrowthPoint } from '@/types/apis/child'

interface GrowthChartProps {
  points: GrowthPoint[]
  metric: GrowthMetric
}

const WIDTH = 320
const HEIGHT = 160
const PADDING = { top: 12, right: 12, bottom: 24, left: 32 }

/**
 * 성장 기록 꺾은선.
 * 차트 라이브러리를 추가하지 않고 SVG 로 직접 그린다 (모바일 화면에 축 2개짜리 선 하나면 충분).
 * WHO 중앙값(medianValue)이 있으면 회색 기준선으로 함께 그려 비교할 수 있게 한다.
 */
const GrowthChart = ({ points, metric }: GrowthChartProps): ReactElement => {
  const gradientId = useId()
  const sorted = [...points].sort((a, b) => a.ageMonths - b.ageMonths)

  const unit = sorted[0]?.unit ?? (metric === 'WEIGHT' ? 'kg' : 'cm')
  const values = sorted.flatMap((p) => [p.value, ...(p.medianValue != null ? [p.medianValue] : [])])
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueSpan = maxValue - minValue || 1

  const minAge = sorted[0]?.ageMonths ?? 0
  const maxAge = sorted[sorted.length - 1]?.ageMonths ?? 1
  const ageSpan = maxAge - minAge || 1

  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom

  const toX = (ageMonths: number) => PADDING.left + ((ageMonths - minAge) / ageSpan) * innerWidth
  const toY = (value: number) =>
    PADDING.top + innerHeight - ((value - minValue) / valueSpan) * innerHeight

  const linePath = sorted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.ageMonths)} ${toY(p.value)}`)
    .join(' ')

  const medianPoints = sorted.filter((p) => p.medianValue != null)
  const medianPath = medianPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.ageMonths)} ${toY(p.medianValue as number)}`)
    .join(' ')

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${GROWTH_METRIC_LABEL[metric]} 성장 기록 그래프`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-green-400)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-green-400)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 가로 기준선 */}
        {[0, 0.5, 1].map((ratio) => {
          const y = PADDING.top + innerHeight * ratio
          const value = maxValue - valueSpan * ratio
          return (
            <g key={ratio}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={WIDTH - PADDING.right}
                y2={y}
                stroke="var(--color-gray-200)"
                strokeWidth="1"
              />
              <text x="2" y={y + 3} fontSize="9" fill="var(--color-gray-500)">
                {value.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* WHO 중앙값 */}
        {medianPath && (
          <path
            d={medianPath}
            fill="none"
            stroke="var(--color-gray-400)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}

        {/* 측정값 */}
        {sorted.length > 1 && (
          <path
            d={`${linePath} L ${toX(maxAge)} ${PADDING.top + innerHeight} L ${toX(minAge)} ${PADDING.top + innerHeight} Z`}
            fill={`url(#${gradientId})`}
          />
        )}
        <path d={linePath} fill="none" stroke="var(--color-green-600)" strokeWidth="2" />
        {sorted.map((p) => (
          <circle
            key={`${p.recordDate}-${p.ageMonths}`}
            cx={toX(p.ageMonths)}
            cy={toY(p.value)}
            r="3"
            fill="var(--color-green-600)"
          />
        ))}

        {/* 가로축 라벨 */}
        <text x={PADDING.left} y={HEIGHT - 6} fontSize="9" fill="var(--color-gray-500)">
          {`${minAge}개월`}
        </text>
        <text
          x={WIDTH - PADDING.right}
          y={HEIGHT - 6}
          fontSize="9"
          fill="var(--color-gray-500)"
          textAnchor="end"
        >
          {`${maxAge}개월`}
        </text>
      </svg>

      <figcaption className="text-c1-regular flex items-center gap-3 text-gray-600">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-4 rounded bg-green-600" />
          {`우리 아이 (${unit})`}
        </span>
        {medianPath && (
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-4 rounded bg-gray-400" />
            WHO 중앙값
          </span>
        )}
      </figcaption>
    </figure>
  )
}

export default GrowthChart
