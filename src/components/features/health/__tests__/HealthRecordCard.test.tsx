import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HealthRecordCard from '@/components/features/health/HealthRecordCard'
import { HealthRecord } from '@/types/apis/health'

const baseRecord: HealthRecord = {
  id: 1,
  childId: '5',
  childName: '지우',
  userId: '1',
  recordType: 'CHECKUP',
  title: '12개월 영유아 검진',
  description: null,
  recordDate: '2026-03-02',
  nextDate: null,
  location: null,
  doctorName: null,
  hospitalName: null,
  height: null,
  weight: null,
  temperature: null,
  bloodPressure: null,
  pulseRate: null,
  vaccineName: null,
  isCompleted: false,
  createdAt: null,
  updatedAt: null,
}

describe('HealthRecordCard', () => {
  it('제목·기록일·아이 이름을 보여준다', () => {
    render(<HealthRecordCard record={baseRecord} />)

    expect(screen.getByText('12개월 영유아 검진')).toBeInTheDocument()
    expect(screen.getByText(/2026\.03\.02/)).toBeInTheDocument()
    expect(screen.getByText(/지우/)).toBeInTheDocument()
  })

  it('기록 종류를 한글 라벨로 바꿔 보여준다', () => {
    render(<HealthRecordCard record={{ ...baseRecord, recordType: 'VACCINATION' }} />)

    expect(screen.getByText('예방접종')).toBeInTheDocument()
  })

  it('서버에만 있던 기록 종류(치과·응급 등)도 한글 라벨로 보여준다', () => {
    render(<HealthRecordCard record={{ ...baseRecord, recordType: 'DENTAL' }} />)

    expect(screen.getByText('치과')).toBeInTheDocument()
  })

  it('프런트가 모르는 새 기록 종류는 원본 값이라도 보여준다', () => {
    // 라벨 매핑에 없다고 빈칸이 되면 사용자가 무슨 기록인지 알 수 없다.
    render(<HealthRecordCard record={{ ...baseRecord, recordType: 'SOMETHING_NEW' }} />)

    expect(screen.getByText('SOMETHING_NEW')).toBeInTheDocument()
  })

  it('측정값이 있으면 요약해서 보여준다', () => {
    render(
      <HealthRecordCard record={{ ...baseRecord, height: 76.5, weight: 9.8, temperature: 36.8 }} />,
    )

    expect(screen.getByText('키 76.5cm · 몸무게 9.8kg · 체온 36.8℃')).toBeInTheDocument()
  })

  it('측정값이 없으면 요약 줄 자체를 그리지 않는다', () => {
    render(<HealthRecordCard record={baseRecord} />)

    expect(screen.queryByText(/키 /)).not.toBeInTheDocument()
    expect(screen.queryByText(/몸무게 /)).not.toBeInTheDocument()
  })

  it('측정값이 0 이어도 누락으로 보지 않는다', () => {
    // null 체크를 falsy 체크로 하면 0 이 사라진다.
    render(<HealthRecordCard record={{ ...baseRecord, weight: 0 }} />)

    expect(screen.getByText('몸무게 0kg')).toBeInTheDocument()
  })

  it('다음 예정일이 있으면 따로 안내한다', () => {
    render(<HealthRecordCard record={{ ...baseRecord, nextDate: '2026-09-02' }} />)

    expect(screen.getByText('다음 예정 2026.09.02')).toBeInTheDocument()
  })
})
