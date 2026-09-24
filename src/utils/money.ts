const MAN = 10_000
const EOK = 100_000_000

/**
 * 지원금 금액을 한국식 단위로 줄여 표시한다.
 * 화면이 좁아 "1,200,000원" 보다 "120만원" 이 읽기 쉽고, 비교할 때도 자릿수를 덜 센다.
 */
export const formatAmount = (amount?: number | null): string => {
  if (amount == null) return '금액 미상'

  const sign = amount < 0 ? '-' : ''
  const value = Math.abs(amount)

  if (value === 0) return '0원'
  if (value < MAN) return `${sign}${value.toLocaleString('ko-KR')}원`

  if (value < EOK) {
    const man = value / MAN
    // 만 단위가 딱 떨어지지 않으면 소수 한 자리까지만 남긴다 (135.7만원)
    const rounded = Number.isInteger(man) ? man : Math.round(man * 10) / 10
    return `${sign}${rounded.toLocaleString('ko-KR')}만원`
  }

  const eok = Math.round((value / EOK) * 10) / 10
  return `${sign}${eok.toLocaleString('ko-KR')}억원`
}

/** 차액 표시용. 부호를 명시해 방향을 분명히 한다. */
export const formatDifference = (amount: number): string => {
  if (amount === 0) return '차이 없음'
  return `${amount > 0 ? '+' : '-'}${formatAmount(Math.abs(amount))}`
}

/** 월령을 "1세 6개월" 형태로. 정책 대상 구간 표시에 쓴다. */
export const formatMonths = (months?: number | null): string => {
  if (months == null) return '-'
  if (months < 12) return `${months}개월`

  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest === 0 ? `${years}세` : `${years}세 ${rest}개월`
}
