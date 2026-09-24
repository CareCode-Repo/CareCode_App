import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { getErrorMessage, parseConsentRequired } from '@/apis/errors'

const makeAxiosError = (status: number, data: unknown): AxiosError => {
  const error = new AxiosError('request failed')
  error.response = {
    status,
    statusText: '',
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }
  return error
}

const CONSENT_BODY = {
  error: 'CONSENT_REQUIRED',
  consentType: 'HEALTH_DATA',
  displayName: '건강정보 수집·이용 (민감정보)',
  sensitive: true,
  message: '건강정보 수집·이용 (민감정보) 동의가 필요합니다.',
  path: 'uri=/health/records',
}

describe('parseConsentRequired', () => {
  it('동의 미완료 403 을 인식한다', () => {
    const requirement = parseConsentRequired(makeAxiosError(403, CONSENT_BODY))

    expect(requirement?.consentType).toBe('HEALTH_DATA')
    expect(requirement?.sensitive).toBe(true)
  })

  it('권한 부족 403 은 동의 문제로 보지 않는다', () => {
    // 둘 다 403 이지만 사용자가 할 수 있는 일이 다르다. 섞으면 안 된다.
    expect(
      parseConsentRequired(makeAxiosError(403, { message: '접근 권한이 없습니다.' })),
    ).toBeNull()
  })

  it('같은 본문이라도 403 이 아니면 무시한다', () => {
    expect(parseConsentRequired(makeAxiosError(400, CONSENT_BODY))).toBeNull()
  })

  it('Axios 오류가 아니면 무시한다', () => {
    expect(parseConsentRequired(new Error('boom'))).toBeNull()
    expect(parseConsentRequired(null)).toBeNull()
  })
})

describe('getErrorMessage', () => {
  it('서버가 준 메시지를 그대로 쓴다', () => {
    expect(
      getErrorMessage(makeAxiosError(409, { message: '이미 좋아요를 누른 병원입니다.' }), '실패'),
    ).toBe('이미 좋아요를 누른 병원입니다.')
  })

  it('본문이 문자열이면 그대로 쓴다', () => {
    expect(getErrorMessage(makeAxiosError(409, '이미 처리된 요청입니다.'), '실패')).toBe(
      '이미 처리된 요청입니다.',
    )
  })

  it('메시지가 비어 있으면 기본 문구로 돌아간다', () => {
    expect(
      getErrorMessage(makeAxiosError(500, { message: '   ' }), '잠시 후 다시 시도해주세요.'),
    ).toBe('잠시 후 다시 시도해주세요.')
  })

  it('Axios 오류가 아니면 기본 문구를 쓴다', () => {
    expect(getErrorMessage(new Error('boom'), '기본 문구')).toBe('기본 문구')
  })
})
