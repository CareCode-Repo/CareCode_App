import { describe, expect, it } from 'vitest'
import { formatAmount, formatDifference, formatMonths } from '@/utils/money'

describe('formatAmount', () => {
  it('만원 미만은 원 단위로 표시한다', () => {
    expect(formatAmount(5_000)).toBe('5,000원')
  })

  it('만 단위로 줄여 표시한다', () => {
    expect(formatAmount(1_200_000)).toBe('120만원')
  })

  it('만 단위가 딱 떨어지지 않으면 소수 한 자리까지만 남긴다', () => {
    expect(formatAmount(1_357_000)).toBe('135.7만원')
  })

  it('억 단위까지 줄인다', () => {
    expect(formatAmount(230_000_000)).toBe('2.3억원')
  })

  it('금액이 없으면 0원이 아니라 미상으로 표시한다', () => {
    // 0원과 "확인되지 않음" 은 사용자에게 전혀 다른 의미다.
    expect(formatAmount(null)).toBe('금액 미상')
    expect(formatAmount(undefined)).toBe('금액 미상')
    expect(formatAmount(0)).toBe('0원')
  })

  it('음수도 부호를 유지한다', () => {
    expect(formatAmount(-500_000)).toBe('-50만원')
  })
})

describe('formatDifference', () => {
  it('더 받는 경우 +를 붙인다', () => {
    expect(formatDifference(3_000_000)).toBe('+300만원')
  })

  it('덜 받는 경우 -를 붙인다', () => {
    expect(formatDifference(-1_500_000)).toBe('-150만원')
  })

  it('차이가 없으면 부호 대신 문구로 알린다', () => {
    expect(formatDifference(0)).toBe('차이 없음')
  })
})

describe('formatMonths', () => {
  it('12개월 미만은 개월로 표시한다', () => {
    expect(formatMonths(8)).toBe('8개월')
  })

  it('12개월 이상은 세 + 개월로 표시한다', () => {
    expect(formatMonths(30)).toBe('2세 6개월')
  })

  it('개월 나머지가 없으면 세만 표시한다', () => {
    expect(formatMonths(24)).toBe('2세')
  })

  it('값이 없으면 기본 표시로 처리한다', () => {
    expect(formatMonths(null)).toBe('-')
  })
})
