import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatChildAge, formatDate, getChildAgeYears, toDate } from '@/utils/date'

describe('toDate / formatDate', () => {
  it('서버가 null 을 줘도 화면이 깨지지 않는다', () => {
    expect(toDate(null)).toBeNull()
    expect(formatDate(null)).toBe('-')
    expect(formatDate(undefined)).toBe('-')
  })

  it('형식이 깨진 문자열도 예외 대신 기본 표시로 처리한다', () => {
    expect(formatDate('not-a-date')).toBe('-')
  })

  it('yyyy-MM-dd 를 표시 형식으로 바꾼다', () => {
    expect(formatDate('2026-08-04')).toBe('2026.08.04')
  })
})

describe('formatChildAge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T00:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('만 1년 미만은 개월 수로 표시한다', () => {
    expect(formatChildAge('2026-02-04')).toBe('6개월')
  })

  it('만 1년 이상은 세 + 개월로 표시한다', () => {
    expect(formatChildAge('2024-05-04')).toBe('2세 3개월')
  })

  it('개월 나머지가 없으면 세만 표시한다', () => {
    expect(formatChildAge('2024-08-04')).toBe('2세')
  })

  it('생년월일이 없으면 기본 표시로 처리한다', () => {
    expect(formatChildAge(null)).toBe('-')
  })

  it('미래 날짜는 계산하지 않는다', () => {
    expect(formatChildAge('2027-01-01')).toBe('-')
  })
})

describe('getChildAgeYears', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T00:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('예약 폼에 넣을 만 나이를 계산한다', () => {
    expect(getChildAgeYears('2024-05-04')).toBe(2)
  })

  it('돌 이전은 0세로 본다', () => {
    expect(getChildAgeYears('2026-02-04')).toBe(0)
  })

  it('생년월일이 없으면 null 을 준다', () => {
    expect(getChildAgeYears(null)).toBeNull()
  })
})
