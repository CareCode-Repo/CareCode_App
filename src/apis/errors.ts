import { AxiosError } from 'axios'
import { z } from 'zod'

/**
 * 서버가 동의 미완료로 접근을 막을 때 내려주는 403 본문.
 * (CustomizedResponseEntityExceptionHandler#handleConsentRequired)
 */
export const consentRequiredErrorSchema = z.object({
  error: z.literal('CONSENT_REQUIRED'),
  consentType: z.string(),
  displayName: z.string().nullish(),
  sensitive: z.boolean().nullish(),
  message: z.string().nullish(),
})
export type ConsentRequiredError = z.infer<typeof consentRequiredErrorSchema>

/**
 * 동의가 없어서 막힌 요청인지 판별한다.
 *
 * 같은 403 이라도 권한 부족과 동의 미완료는 사용자가 할 일이 다르다.
 * 전자는 막다른 길이지만 후자는 동의만 하면 바로 풀리므로 화면에서 구분해야 한다.
 */
export const parseConsentRequired = (error: unknown): ConsentRequiredError | null => {
  if (!(error instanceof AxiosError) || error.response?.status !== 403) return null

  const parsed = consentRequiredErrorSchema.safeParse(error.response.data)
  return parsed.success ? parsed.data : null
}

/** 서버가 내려준 메시지를 우선 쓰고, 없으면 기본 문구로 돌아간다. */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof AxiosError)) return fallback

  const data = error.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }

  return fallback
}
