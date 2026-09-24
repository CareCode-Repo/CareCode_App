import { ReactElement } from 'react'

interface UserTrendChartProps {
  labels: string[]
  data: number[]
}

const WIDTH = 320
const HEIGHT = 120
const PADDING = { top: 8, right: 8, bottom: 20, left: 8 }

/**
 * 월별 신규 가입 추이 막대.
 * 값 자체보다 "늘고 있는지" 를 보는 용도라 축 눈금 없이 막대와 양끝 라벨만 둔다.
 */
const UserTrendChart = ({ labels, data }: UserTrendChartProps): ReactElement => {
  const max = Math.max(...data, 1)
  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom

  const gap = 4
  const barWidth = data.length > 0 ? Math.max(2, innerWidth / data.length - gap) : 0

  return (
    <figure className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="월별 신규 가입자 추이"
      >
        {data.map((value, index) => {
          const barHeight = (value / max) * innerHeight
          const x = PADDING.left + index * (barWidth + gap)
          const y = PADDING.top + innerHeight - barHeight

          return (
            <rect
              key={labels[index] ?? index}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(1, barHeight)}
              rx="2"
              fill="var(--color-green-500)"
            />
          )
        })}

        {labels.length > 0 && (
          <>
            <text x={PADDING.left} y={HEIGHT - 6} fontSize="9" fill="var(--color-gray-500)">
              {labels[0]}
            </text>
            <text
              x={WIDTH - PADDING.right}
              y={HEIGHT - 6}
              fontSize="9"
              fill="var(--color-gray-500)"
              textAnchor="end"
            >
              {labels[labels.length - 1]}
            </text>
          </>
        )}
      </svg>

      <figcaption className="text-c1-regular text-gray-600">
        {`최대 ${max.toLocaleString('ko-KR')}명 / 월`}
      </figcaption>
    </figure>
  )
}

export default UserTrendChart
