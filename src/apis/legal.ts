import { z } from 'zod'
import { CareCode } from './interceptor'

export const LegalDocumentType = ['terms', 'privacy-policy'] as const
export type LegalDocumentType = (typeof LegalDocumentType)[number]

export const LEGAL_DOCUMENT_LABEL: Record<LegalDocumentType, string> = {
  terms: '서비스 이용약관',
  'privacy-policy': '개인정보 처리방침',
}

const legalVersionSchema = z.object({ version: z.string() })

/**
 * 현재 시행 중인 약관 버전.
 *
 * 동의 이력에 남는 값이므로 서버가 알려주는 것을 그대로 써야 한다.
 * 프런트에 상수로 박아 두면 서버가 개정할 때 잘못된 버전으로 동의가 기록된다.
 */
export const getLegalVersion = async (): Promise<string> => {
  const res = await CareCode.get('/legal/version')
  return legalVersionSchema.parse(res.data).version
}

/** 약관 원문. 마크다운 텍스트로 내려온다. */
export const getLegalDocument = async (
  type: LegalDocumentType,
  version?: string,
): Promise<string> => {
  const res = await CareCode.get(`/legal/${type}`, {
    params: version ? { version } : {},
    // 서버가 text/markdown 으로 주므로 axios 가 JSON 으로 파싱하지 않게 한다.
    responseType: 'text',
    headers: { Accept: 'text/markdown' },
  })
  return z.string().parse(res.data)
}
