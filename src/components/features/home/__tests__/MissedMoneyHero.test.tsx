import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MissedMoneyHero from '@/components/features/home/MissedMoneyHero'
import { Child } from '@/types/apis/child'
import { MissedBenefit, MissedBenefitSummary } from '@/types/apis/policy'

/**
 * 홈이 던지는 첫 문장.
 *
 * 이 화면의 값어치는 숫자가 커 보이는 데 있지 않고 **맞는** 데 있다. 금액이 확인되지 않은 정책은
 * 합계에서 빠지는데 그 사실을 적지 않으면 사용자는 적힌 금액을 전부라고 읽는다. 한 번 어긋나면
 * 그다음부터는 앱이 말하는 어떤 숫자도 믿지 않는다.
 *
 * 아이를 아직 등록하지 않은 사람에게 아무것도 보여주지 않던 것도 여기서 막는다. 설득이 가장
 * 필요한 사람에게 홈이 텅 빈 채로 열리던 결함이었다.
 */

const h = vi.hoisted(() => ({
  token: { value: 'token' as string | null },
  push: vi.fn(),
}))

vi.mock('@/apis/auth', () => ({ getAccessToken: () => h.token.value }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: h.push }) }))

const children = vi.hoisted(() => ({ value: [] as Child[] }))
const summary = vi.hoisted(() => ({ value: null as MissedBenefitSummary | null }))

vi.mock('@/queries/child', () => ({
  useMyChildren: () => ({ data: children.value, isLoading: false }),
}))
vi.mock('@/queries/policy', () => ({
  useMissedBenefits: () => ({ data: summary.value, isLoading: false }),
}))

const child = (name: string): Child => ({
  id: 1,
  userId: 1,
  name,
  birthDate: '2024-03-02',
  gender: null,
  specialNeeds: null,
  createdAt: null,
  updatedAt: null,
})

const benefit = (overrides: Partial<MissedBenefit> = {}): MissedBenefit =>
  ({
    policyId: 1,
    title: '첫만남이용권',
    childName: '서준',
    eligibleFromMonth: 0,
    eligibleToMonth: 12,
    claimable: true,
    remainingMonths: 3,
    benefitAmount: 2_000_000,
    applicationUrl: null,
    reasons: [],
    ...overrides,
  }) as MissedBenefit

const buildSummary = (overrides: Partial<MissedBenefitSummary> = {}): MissedBenefitSummary => ({
  claimableCount: 1,
  claimableAmount: 2_000_000,
  expiredCount: 0,
  unknownEligibilityCount: 0,
  claimable: [benefit()],
  expired: [],
  ...overrides,
})

const renderHero = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrapper = ({ node }: { node: ReactNode }): ReactElement => (
    <QueryClientProvider client={client}>{node}</QueryClientProvider>
  )
  render(<Wrapper node={<MissedMoneyHero />} />)
}

describe('MissedMoneyHero', () => {
  beforeEach(() => {
    h.token.value = 'token'
    children.value = [child('서준')]
    summary.value = buildSummary()
    h.push.mockClear()
  })

  it('놓친 금액과 신청 가능 건수를 보여준다', () => {
    renderHero()

    expect(screen.getByText('200만원')).toBeInTheDocument()
    expect(screen.getByText(/지금 신청할 수 있는 1건/)).toBeInTheDocument()
  })

  it('금액이 확인되지 않은 건이 섞이면 합계가 일부 기준임을 밝힌다', () => {
    summary.value = buildSummary({
      claimableCount: 2,
      claimableAmount: 2_000_000,
      claimable: [benefit(), benefit({ policyId: 2, benefitAmount: null })],
    })

    renderHero()

    // 2건 중 금액이 확인된 건 1건뿐이다. 200만원을 2건의 합계로 읽히게 두면 안 된다.
    expect(screen.getByText(/금액 확인된 1건 합계/)).toBeInTheDocument()
  })

  it('아이를 등록하지 않았으면 빈 화면 대신 등록할 이유를 준다', () => {
    children.value = []

    renderHero()

    expect(screen.getByRole('heading', { name: /놓치고 있는 지원금/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '아이 등록하고 찾아보기' })).toBeInTheDocument()
  })

  it('소득 정보가 없어 보류한 건이 있으면 해결 방법까지 알려준다', () => {
    summary.value = buildSummary({ unknownEligibilityCount: 4 })

    renderHero()

    expect(screen.getByText(/소득 정보를 입력하면 4건/)).toBeInTheDocument()
  })

  it('소급 신청할 건이 없으면 지나간 건만 안내한다', () => {
    summary.value = buildSummary({
      claimableCount: 0,
      claimableAmount: 0,
      claimable: [],
      expiredCount: 3,
    })

    renderHero()

    expect(
      screen.getByRole('heading', { name: /신청할 수 있는 지원금은 없어요/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/대상 기간이 지난 3건/)).toBeInTheDocument()
  })

  it('놓친 것이 하나도 없으면 확인했다는 사실을 돌려준다', () => {
    summary.value = buildSummary({
      claimableCount: 0,
      claimableAmount: 0,
      claimable: [],
      expiredCount: 0,
    })

    renderHero()

    expect(screen.getByRole('heading', { name: /놓치고 있는 지원금은 없어요/ })).toBeInTheDocument()
  })

  it('로그인하지 않았으면 그리지 않는다', () => {
    h.token.value = null

    const { container } = (() => {
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      return render(
        <QueryClientProvider client={client}>
          <MissedMoneyHero />
        </QueryClientProvider>,
      )
    })()

    expect(container).toBeEmptyDOMElement()
  })
})
