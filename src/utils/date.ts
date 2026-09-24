import { differenceInMonths, format, isValid, parseISO } from 'date-fns'

/** 서버가 주는 날짜 문자열은 비어 있을 수 있어 안전하게 변환한다. */
export const toDate = (value?: string | null): Date | null => {
  if (!value) return null
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : null
}

export const formatDate = (value?: string | null, pattern = 'yyyy.MM.dd'): string => {
  const date = toDate(value)
  return date ? format(date, pattern) : '-'
}

/** 생년월일로 "2세 3개월" 형태의 표시용 나이를 만든다. */
export const formatChildAge = (birthDate?: string | null): string => {
  const birth = toDate(birthDate)
  if (!birth) return '-'

  const months = differenceInMonths(new Date(), birth)
  if (months < 0) return '-'
  if (months < 12) return `${months}개월`

  const years = Math.floor(months / 12)
  const restMonths = months % 12
  return restMonths === 0 ? `${years}세` : `${years}세 ${restMonths}개월`
}

/** 만 나이 (예약 폼의 childAge 등 숫자 입력이 필요한 곳) */
export const getChildAgeYears = (birthDate?: string | null): number | null => {
  const birth = toDate(birthDate)
  if (!birth) return null
  return Math.max(0, Math.floor(differenceInMonths(new Date(), birth) / 12))
}
