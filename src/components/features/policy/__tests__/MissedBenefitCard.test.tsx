import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MissedBenefitCard from '@/components/features/policy/MissedBenefitCard'
import { MissedBenefit } from '@/types/apis/policy'

const baseBenefit: MissedBenefit = {
  policyId: 7,
  title: '첫만남이용권',
  childName: '지우',
  eligibleFromMonth: 0,
  eligibleToMonth: 12,
  claimable: true,
  remainingMonths: 6,
  benefitAmount: 2_000_000,
  applicationUrl: 'https://example.gov/apply',
  reasons: ['출생 후 1년 이내 신청 가능'],
}

describe('MissedBenefitCard', () => {
  it('금액과 남은 기간을 보여준다', () => {
    render(<MissedBenefitCard benefit={baseBenefit} />)

    expect(screen.getByText('200만원')).toBeInTheDocument()
    expect(screen.getByText('6개월 남음')).toBeInTheDocument()
  })

  it('신청 가능하면 집계 경로를 거치는 신청 링크를 건다', () => {
    // applicationUrl 로 직접 보내면 전환이 집계되지 않는다.
    render(<MissedBenefitCard benefit={baseBenefit} />)

    const link = screen.getByRole('link', { name: '지금 신청하기' })
    expect(link).toHaveAttribute('href', expect.stringContaining('/policies/7/apply'))
    expect(link).not.toHaveAttribute('href', 'https://example.gov/apply')
  })

  it('기간이 지난 건은 신청 링크를 숨긴다', () => {
    render(
      <MissedBenefitCard benefit={{ ...baseBenefit, claimable: false, remainingMonths: null }} />,
    )

    expect(screen.getByText('기간 종료')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '지금 신청하기' })).not.toBeInTheDocument()
  })

  it('금액을 모르면 0원이 아니라 미상으로 알린다', () => {
    render(<MissedBenefitCard benefit={{ ...baseBenefit, benefitAmount: null }} />)

    expect(screen.getByText('금액 미상')).toBeInTheDocument()
  })

  it('대상 구간과 추천 근거를 함께 보여준다', () => {
    render(<MissedBenefitCard benefit={baseBenefit} />)

    expect(screen.getByText('0개월~1세 대상')).toBeInTheDocument()
    expect(screen.getByText('· 출생 후 1년 이내 신청 가능')).toBeInTheDocument()
  })

  it('남은 기간을 모르면 신청 가능 여부만 알린다', () => {
    render(<MissedBenefitCard benefit={{ ...baseBenefit, remainingMonths: null }} />)

    expect(screen.getByText('신청 가능')).toBeInTheDocument()
  })
})
