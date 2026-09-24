import { z } from 'zod'

/**
 * 서버 `UserRole` enum 과 1:1 로 맞춘다.
 * 여기 없는 값을 다른 스키마가 쓰면 그 응답은 파싱 단계에서 통째로 실패한다.
 * (실제로 로그인 응답이 `['PARENT', 'CHILD']` 로 좁혀져 있어 관리자·보육사는 로그인이 깨졌다)
 */
export const USER_ROLE = ['PARENT', 'CAREGIVER', 'ADMIN', 'GUEST'] as const
export const userRoleSchema = z.enum(USER_ROLE)
export type UserRoleValue = z.infer<typeof userRoleSchema>

export const USER_ROLE_LABEL: Record<string, string> = {
  PARENT: '부모',
  CAREGIVER: '보육사',
  ADMIN: '관리자',
  GUEST: '게스트',
}

/**
 * 서버 UserDto 대응 스키마.
 * 카카오 가입 직후에는 식별자를 제외한 대부분이 비어 있으므로 nullish 로 둔다.
 * (password 는 WRITE_ONLY 라 응답에 포함되지 않는다)
 */
export const userSchema = z.object({
  id: z.number(),
  userId: z.string(),
  email: z.string().nullish(),
  name: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  birthDate: z.string().nullish(), // date
  gender: z.string().nullish(),
  address: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  profileImageUrl: z.string().nullish(),
  role: z.string().nullish(),
  provider: z.string().nullish(),
  providerId: z.string().nullish(),
  isActive: z.boolean().nullish(),
  emailVerified: z.boolean().nullish(),
  registrationCompleted: z.boolean().nullish(),
  deletedAt: z.string().nullish(), // date-time
  lastLoginAt: z.string().nullish(), // date-time
  createdAt: z.string().nullish(), // date-time
  updatedAt: z.string().nullish(), // date-time
})
export type User = z.infer<typeof userSchema>

// GET /users/profile
export const getUserInfoResponseSchema = userSchema
export type GetUserInfoResponse = z.infer<typeof getUserInfoResponseSchema>

// PUT /users/profile
export const putUserInfoBodySchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  profileImageUrl: z.string().optional(),
})
export type PutUserInfoBody = z.infer<typeof putUserInfoBodySchema>
export const putUserInfoResponseSchema = userSchema
export type PutUserInfoResponse = z.infer<typeof putUserInfoResponseSchema>

// POST /users/me/profile-image - multipart 업로드
export const profileImageResponseSchema = z.object({
  profileImageUrl: z.string(),
})
export type ProfileImageResponse = z.infer<typeof profileImageResponseSchema>

// GET /users/profile/completion
/**
 * GET /users/profile/completion — 서버 UserProfileCompletionResponse 대응.
 *
 * 예전 스키마는 `completionRate` / `missingFields: string[]` 를 기다렸지만 서버는
 * `completionPercentage` 와 **불리언 맵**을 준다. 모든 필드가 nullish 라 파싱은 통과했고,
 * 값은 전부 undefined 가 되어 "완성도 0%, 빠진 항목 없음" 처럼 조용히 틀렸다.
 * (`complete` 도 못 읽어 이미 다 채운 사용자에게도 안내가 계속 떴다)
 */
export const profileMissingFieldsSchema = z.object({
  needsRealName: z.boolean().nullish(),
  needsPhoneNumber: z.boolean().nullish(),
  needsBirthDate: z.boolean().nullish(),
  needsGender: z.boolean().nullish(),
  needsAddress: z.boolean().nullish(),
})
export type ProfileMissingFields = z.infer<typeof profileMissingFieldsSchema>

export const getProfileCompletionResponseSchema = z.object({
  complete: z.boolean().nullish(),
  completionPercentage: z.number().nullish(),
  message: z.string().nullish(),
  missingFields: profileMissingFieldsSchema.nullish(),
  completedFields: z.number().nullish(),
  totalFields: z.number().nullish(),
})
export type GetProfileCompletionResponse = z.infer<typeof getProfileCompletionResponseSchema>
