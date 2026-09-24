import { CareCode } from './interceptor'
import {
  ConsentHistoryItem,
  consentHistoryItemSchema,
  ConsentStatusResponse,
  consentStatusResponseSchema,
  ConsentUpdateBody,
  consentUpdateBodySchema,
  ExportMyDataResponse,
  exportMyDataResponseSchema,
} from '@/types/apis/privacy'

// GET /users/privacy/consents
export const getConsents = async (): Promise<ConsentStatusResponse> => {
  const res = await CareCode.get('/users/privacy/consents')
  return consentStatusResponseSchema.parse(res.data)
}

// POST /users/privacy/consents - 동의 이력은 덮어쓰지 않고 새 기록으로 남는다
export const postConsent = async (body: ConsentUpdateBody): Promise<ConsentStatusResponse> => {
  const parsedBody = consentUpdateBodySchema.parse(body)
  const res = await CareCode.post('/users/privacy/consents', parsedBody)
  return consentStatusResponseSchema.parse(res.data)
}

// GET /users/privacy/consents/history
export const getConsentHistory = async (): Promise<ConsentHistoryItem[]> => {
  const res = await CareCode.get('/users/privacy/consents/history')
  return consentHistoryItemSchema.array().parse(res.data)
}

// GET /users/privacy/export - 내 데이터 내려받기
export const getMyDataExport = async (): Promise<ExportMyDataResponse> => {
  const res = await CareCode.get('/users/privacy/export')
  return exportMyDataResponseSchema.parse(res.data)
}

// DELETE /users/privacy/account - 회원 탈퇴
export const deleteAccount = async (): Promise<void> => {
  await CareCode.delete('/users/privacy/account')
}
