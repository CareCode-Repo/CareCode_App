import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FunnelChart from '@/components/features/admin/FunnelChart'
import { FunnelStep } from '@/types/apis/admin'

const steps: FunnelStep[] = [
  { event: 'SIGNED_UP', label: null, users: 1000, conversionRate: null },
  { event: 'CHILD_REGISTERED', label: null, users: 700, conversionRate: 70 },
  { event: 'BENEFIT_LINK_CLICKED', label: null, users: 210, conversionRate: 30 },
]

describe('FunnelChart', () => {
  it('이벤트 코드를 읽을 수 있는 이름으로 바꿔 보여준다', () => {
    render(<FunnelChart steps={steps} />)

    expect(screen.getByText('가입')).toBeInTheDocument()
    expect(screen.getByText('지원금 신청 클릭')).toBeInTheDocument()
  })

  it('서버가 라벨을 주면 그 값을 우선한다', () => {
    render(<FunnelChart steps={[{ ...steps[0], label: '신규 가입자' }]} />)

    expect(screen.getByText('신규 가입자')).toBeInTheDocument()
    expect(screen.queryByText('가입')).not.toBeInTheDocument()
  })

  it('매핑에 없는 이벤트도 코드 그대로 보여준다', () => {
    render(
      <FunnelChart
        steps={[{ event: 'UNKNOWN_EVENT', label: null, users: 5, conversionRate: null }]}
      />,
    )

    expect(screen.getByText('UNKNOWN_EVENT')).toBeInTheDocument()
  })

  it('첫 단계에는 전환율을 표시하지 않는다', () => {
    // 비교 대상이 없는데 100% 로 적으면 잘못 읽힌다.
    render(<FunnelChart steps={[steps[0]]} />)

    expect(screen.queryByText(/직전 단계 대비/)).not.toBeInTheDocument()
  })

  it('전환율이 낮은 구간을 이탈 구간으로 표시한다', () => {
    render(<FunnelChart steps={steps} />)

    // 30% 구간만 병목으로 잡혀야 한다 (70% 는 아님)
    expect(screen.getByText('직전 단계 대비 30% · 이탈이 큰 구간')).toBeInTheDocument()
    expect(screen.getByText('직전 단계 대비 70%')).toBeInTheDocument()
  })

  it('사용자 수를 천 단위로 끊어 보여준다', () => {
    render(<FunnelChart steps={steps} />)

    expect(screen.getByText('1,000명')).toBeInTheDocument()
  })
})
