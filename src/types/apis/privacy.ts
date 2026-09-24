import { z } from 'zod'

export const ConsentType = [
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'CHILD_DATA',
  // 건강·의료 정보는 개인정보보호법상 민감정보라 별도 동의가 필요하다.
  // 이 동의가 없으면 서버가 건강 기록 저장을 403 으로 막는다.
  'HEALTH_DATA',
  'MARKETING',
  'THIRD_PARTY_SHARING',
] as const
export type ConsentType = (typeof ConsentType)[number]

/** 민감정보 항목. 철회하면 해당 기능이 즉시 막히므로 화면에서 따로 안내한다. */
export const SENSITIVE_CONSENT_TYPES: readonly string[] = ['HEALTH_DATA']

/**
 * 약관 버전은 `GET /legal/version` 에서 받아 쓴다 (useLegalVersion).
 *
 * 예전에는 여기 상수로 박아 두었는데 서버 값(`v1.0`)과 어긋나 있었다.
 * 동의 이력에 남는 값이라 틀리면 "무엇에 동의했는지" 를 증명할 수 없게 된다.
 */

// 서버 ConsentStatusResponse.ConsentItem 대응
export const consentItemSchema = z.object({
  consentType: z.string(),
  displayName: z.string().nullish(),
  required: z.boolean().default(false),
  granted: z.boolean().default(false),
  policyVersion: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type ConsentItem = z.infer<typeof consentItemSchema>

export const consentStatusResponseSchema = z.object({
  consents: z
    .array(consentItemSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type ConsentStatusResponse = z.infer<typeof consentStatusResponseSchema>

// 서버 ConsentStatusResponse.ConsentHistoryItem 대응
export const consentHistoryItemSchema = z.object({
  consentType: z.string(),
  displayName: z.string().nullish(),
  granted: z.boolean().default(false),
  policyVersion: z.string().nullish(),
  createdAt: z.string().nullish(),
})
export type ConsentHistoryItem = z.infer<typeof consentHistoryItemSchema>

// POST /users/privacy/consents - 서버 ConsentUpdateRequest 대응
export const consentUpdateBodySchema = z.object({
  consentType: z.enum(ConsentType),
  policyVersion: z.string().min(1),
  granted: z.boolean(),
})
export type ConsentUpdateBody = z.infer<typeof consentUpdateBodySchema>

// GET /users/privacy/export - 서버가 도메인별 데이터를 자유 형식 맵으로 준다
export const exportMyDataResponseSchema = z.record(z.unknown())
export type ExportMyDataResponse = z.infer<typeof exportMyDataResponseSchema>
