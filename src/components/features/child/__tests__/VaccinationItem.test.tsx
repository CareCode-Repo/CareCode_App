import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import VaccinationItem from '@/components/features/child/VaccinationItem'
import { VaccinationSchedule } from '@/types/apis/child'

const baseSchedule: VaccinationSchedule = {
  id: 1,
  childId: 5,
  vaccineType: 'BCG',
  vaccineName: 'BCG (결핵)',
  doseNumber: 1,
  totalDoses: 1,
  dueDate: '2026-04-01',
  completedDate: null,
  status: 'SCHEDULED',
  overdue: false,
}

describe('VaccinationItem', () => {
  it('예정된 접종은 예정일과 완료 버튼을 보여준다', () => {
    render(<VaccinationItem schedule={baseSchedule} onComplete={vi.fn()} />)

    expect(screen.getByText('BCG (결핵)')).toBeInTheDocument()
    expect(screen.getByText(/2026\.04\.01 예정/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '접종 완료' })).toBeInTheDocument()
  })

  it('기한이 지나면 눈에 띄게 표시한다', () => {
    render(<VaccinationItem schedule={{ ...baseSchedule, overdue: true }} onComplete={vi.fn()} />)

    expect(screen.getByText('기한 경과')).toBeInTheDocument()
  })

  it('완료된 접종에는 완료일을 보여주고 완료 버튼을 숨긴다', () => {
    render(
      <VaccinationItem
        schedule={{ ...baseSchedule, status: 'COMPLETED', completedDate: '2026-04-03' }}
        onComplete={vi.fn()}
      />,
    )

    expect(screen.getByText(/2026\.04\.03 접종 완료/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '접종 완료' })).not.toBeInTheDocument()
  })

  it('이미 완료된 항목은 기한이 지났다고 표시하지 않는다', () => {
    // 서버는 완료된 항목에도 overdue=true 를 줄 수 있다. 이미 맞았으면 경고할 이유가 없다.
    render(
      <VaccinationItem
        schedule={{
          ...baseSchedule,
          status: 'COMPLETED',
          completedDate: '2026-05-01',
          overdue: true,
        }}
      />,
    )

    expect(screen.queryByText('기한 경과')).not.toBeInTheDocument()
  })

  it('완료 버튼을 누르면 콜백이 호출된다', async () => {
    const onComplete = vi.fn()
    render(<VaccinationItem schedule={baseSchedule} onComplete={onComplete} />)

    await userEvent.click(screen.getByRole('button', { name: '접종 완료' }))

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('처리 중에는 버튼을 눌러도 중복 요청이 나가지 않는다', async () => {
    const onComplete = vi.fn()
    render(<VaccinationItem schedule={baseSchedule} isCompleting onComplete={onComplete} />)

    const button = screen.getByRole('button', { name: '처리 중' })
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('백신 표시명이 없으면 식별자라도 보여준다', () => {
    render(<VaccinationItem schedule={{ ...baseSchedule, vaccineName: null }} />)

    expect(screen.getByText('BCG')).toBeInTheDocument()
  })
})
