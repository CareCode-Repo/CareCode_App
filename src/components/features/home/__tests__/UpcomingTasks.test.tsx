import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UpcomingTasks from '@/components/features/home/UpcomingTasks'
import { Child, ChildTimeline, TimelineItem } from '@/types/apis/child'

/**
 * 곧 해야 할 일.
 *
 * 접종·검진·지원금 마감은 각각 다른 화면에 있었다. 부모가 "다음에 뭘 해야 하나" 를 알려면 세 곳을
 * 돌아야 했고 그래서 놓쳤다. 이 목록의 값어치는 **순서**에 있다 — 지났는데 안 한 것이 맨 위에
 * 오지 않으면 모아 놓은 의미가 없다.
 */

const h = vi.hoisted(() => ({ token: { value: 'token' as string | null } }))
vi.mock('@/apis/auth', () => ({ getAccessToken: () => h.token.value }))

const children = vi.hoisted(() => ({ value: [] as Child[] }))
const timelines = vi.hoisted(() => ({ value: [] as ChildTimeline[] }))

vi.mock('@/queries/child', () => ({
  useMyChildren: () => ({ data: children.value, isLoading: false }),
  childQueries: { timeline: (childId: number) => ({ queryKey: ['timeline', childId] }) },
}))

vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQueries: () => timelines.value.map((data) => ({ data, isLoading: false })),
}))

const child = (id: number, name: string): Child => ({
  id,
  userId: 1,
  name,
  birthDate: '2024-03-02',
  gender: null,
  specialNeeds: null,
  createdAt: null,
  updatedAt: null,
})

const item = (overrides: Partial<TimelineItem> = {}): TimelineItem => ({
  date: '2026-10-20',
  type: 'VACCINATION',
  status: 'UPCOMING',
  title: 'DTaP 4차',
  description: null,
  referenceId: null,
  ageMonths: 18,
  ...overrides,
})

const timeline = (childName: string, items: TimelineItem[]): ChildTimeline => ({
  childId: 1,
  childName,
  birthDate: '2024-03-02',
  from: null,
  to: null,
  overdueCount: 0,
  upcomingCount: items.length,
  items,
})

describe('UpcomingTasks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T09:00:00+09:00'))
    h.token.value = 'token'
    children.value = [child(1, '서준')]
    timelines.value = [timeline('서준', [item()])]
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('남은 날짜를 D-day 로 보여준다', () => {
    render(<UpcomingTasks />)

    expect(screen.getByText('DTaP 4차')).toBeInTheDocument()
    expect(screen.getByText('D-15')).toBeInTheDocument()
  })

  it('지났는데 하지 않은 일을 맨 위에 둔다', () => {
    timelines.value = [
      timeline('서준', [
        item({ date: '2026-10-10', title: '내일모레 할 일', status: 'UPCOMING' }),
        item({ date: '2026-09-20', title: '놓친 접종', status: 'OVERDUE' }),
      ]),
    ]

    render(<UpcomingTasks />)

    const titles = screen.getAllByText(/내일모레 할 일|놓친 접종/).map((el) => el.textContent)
    expect(titles[0]).toBe('놓친 접종')
    expect(screen.getByText('15일 지남')).toBeInTheDocument()
  })

  it('완료했거나 참고용인 항목은 할 일로 세지 않는다', () => {
    timelines.value = [
      timeline('서준', [
        item({ title: '이미 한 접종', status: 'DONE' }),
        item({ title: '신학기 안내', status: 'INFO', type: 'NEW_TERM' }),
      ]),
    ]

    const { container } = render(<UpcomingTasks />)

    expect(container).toBeEmptyDOMElement()
  })

  it('두 달을 넘겨 다가오는 일은 지금 알리지 않는다', () => {
    timelines.value = [timeline('서준', [item({ date: '2027-03-01', title: '먼 훗날 검진' })])]

    const { container } = render(<UpcomingTasks />)

    expect(container).toBeEmptyDOMElement()
  })

  it('아이가 여럿이면 누구의 할 일인지 밝히고 한 줄로 합친다', () => {
    children.value = [child(1, '서준'), child(2, '서윤')]
    timelines.value = [
      timeline('서준', [item({ date: '2026-10-25', title: '서준 접종' })]),
      timeline('서윤', [item({ date: '2026-10-12', title: '서윤 검진', type: 'CHECKUP' })]),
    ]

    render(<UpcomingTasks />)

    // 가까운 날짜가 먼저 — 부모의 할 일은 아이별로 나뉘어 있지 않다.
    const titles = screen.getAllByText(/서준 접종|서윤 검진/).map((el) => el.textContent)
    expect(titles[0]).toBe('서윤 검진')
    expect(screen.getByText('검진 · 서윤')).toBeInTheDocument()
  })

  it('아이가 하나면 이름을 덧붙이지 않는다', () => {
    render(<UpcomingTasks />)

    expect(screen.getByText('접종')).toBeInTheDocument()
    expect(screen.queryByText('접종 · 서준')).not.toBeInTheDocument()
  })

  it('아이를 등록하지 않았으면 그리지 않는다', () => {
    children.value = []

    const { container } = render(<UpcomingTasks />)

    expect(container).toBeEmptyDOMElement()
  })
})
