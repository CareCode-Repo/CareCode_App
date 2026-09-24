import { z } from 'zod'
import { userRoleSchema, userSchema } from './user'

// login 공통
/**
 * 서버 TokenDto 대응.
 *
 * DTO 에 최상위 `userId`/`email`/`role` 필드가 있지만 `AuthServiceImpl.issueTokenForUser`
 * 는 이 셋을 채우지 않는다 — 신원은 항상 중첩된 `user` 안에 있다(카카오 응답도 같은 모양).
 * 최상위 값을 필수로 두고 있어서 그동안 일반 로그인은 200 을 받고도 파싱 단계에서 실패했다.
 */
const loginSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  refreshExpiresIn: z.number().nullish(),
  user: userSchema,
})
const loginFailSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errorCode: z.string(),
})

// /auth/login
export const postLoginBodySchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(1),
})
export type PostLoginBody = z.infer<typeof postLoginBodySchema>
export const postLoginResponseSchema = z.union([loginSuccessSchema, loginFailSchema])
export type PostLoginResponse = z.infer<typeof postLoginResponseSchema>

export const kakaoProfileSchema = z.object({
  kakaoId: z.string(),
  nickname: z.string(),
  profileImageUrl: z.string().url(),
})

// /auth/kakao/login
const kakaoLoginSuccessSchema = loginSuccessSchema

export const postKakaoLoginBodySchema = z.object({
  kakaoAccessToken: z.string(),
})
export type PostKakaoLoginBody = z.infer<typeof postKakaoLoginBodySchema>

export const postKakaoLoginResponseSchema = kakaoLoginSuccessSchema
export type PostKakaoLoginResponse = z.infer<typeof postKakaoLoginResponseSchema>

const registerBodySchema = z.object({
  kakaoAccessToken: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다'),
  gender: z.enum(['MALE', 'FEMALE']),
  address: z.string().optional(),
})
const registerResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string(),
})

// /auth/kakao/register
export const postKakaoRegisterBodySchema = registerBodySchema
export type PostKakaoRegisterBody = z.infer<typeof postKakaoRegisterBodySchema>
export const postKakaoRegisterResponseSchema = registerResponseSchema
export type PostKakaoRegisterResponse = z.infer<typeof postKakaoRegisterResponseSchema>

// /auth/register
export const postRegisterBodySchema = registerBodySchema
export type PostRegisterBody = z.infer<typeof postRegisterBodySchema>
export const postRegisterResponseSchema = registerResponseSchema
export type PostRegisterResponse = z.infer<typeof postRegisterResponseSchema>

// /auth/refresh
// 리프레시 토큰은 HttpOnly 쿠키로 오가므로 요청 본문이 없다.
// 응답의 refreshToken 도 쿠키를 쓰지 않는 클라이언트를 위한 값이라 읽지 않는다.
/**
 * 갱신 응답도 로그인과 같은 TokenDto 다 — 최상위 userId 는 채워지지 않는다.
 *
 * 여기를 `userId: z.string()` 으로 두는 바람에 서버가 200 과 새 토큰을 줘도 파싱에서
 * 버려졌고, SessionBootstrap 이 그 실패를 세션 만료로 보고 clearTokens() 를 불렀다.
 * 결과적으로 **새로고침할 때마다 로그아웃**됐고 401 재시도도 한 번도 성공하지 못했다.
 */
export const postRefreshTokenResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  user: userSchema,
})
export type PostRefreshTokenResponse = z.infer<typeof postRefreshTokenResponseSchema>

// /auth/logout
export const postLogoutResponseSchema = z.object({
  message: z.string(),
})
export type PostLogoutResponse = z.infer<typeof postLogoutResponseSchema>

/**
 * GET /auth/kakao/login-url — 카카오 인가 페이지 주소.
 *
 * 예전 경로 /oauth2/kakao/auth-url 은 서버에서 2025-10 에 지워졌다. 프런트가 계속 그 경로를 불러
 * 메인 화면의 카카오 로그인 버튼이 404 로 아무 반응이 없었다. 응답 키도 authUrl 이 아니라 loginUrl 이다.
 * redirect_uri 는 서버 설정(KAKAO_REDIRECT_URI)을 쓰므로 프런트가 보내지 않는다.
 */
export const getKakaoAuthUrlResponseSchema = z.object({
  success: z.boolean(),
  loginUrl: z.string().url(),
  message: z.string().nullish(),
})
export type GetKakaoAuthUrlResponse = z.infer<typeof getKakaoAuthUrlResponseSchema>

// POST /api/auth/kakao/auth
export const postKakaoAuthBodySchema = z.object({
  code: z.string(),
})
export type PostKakaoAuthBody = z.infer<typeof postKakaoAuthBodySchema>
const kakaoAuthSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  isNewUser: z.boolean(),
  user: z.object({
    userId: z.string(),
    email: z.string(),
    role: userRoleSchema,
    name: z.string(),
    registrationCompleted: z.boolean().optional(),
  }),
})
const kakaoAuthFailSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errorCode: z.string().optional(),
})
export const postKakaoAuthResponseSchema = z.union([kakaoAuthSuccessSchema, kakaoAuthFailSchema])
export type PostKakaoAuthResponse = z.infer<typeof postKakaoAuthResponseSchema>

// POST /users/auth/users/kakao/complete-registration
export const kakaoRegistrationRequestSchema = z.object({
  name: z
    .string()
    .min(2, '닉네임은 2글자 이상이어야 합니다')
    .max(10, '닉네임은 10글자 이하여야 합니다'),
  role: userRoleSchema,
})
export type KakaoRegistrationRequest = z.infer<typeof kakaoRegistrationRequestSchema>

/**
 * 서버 UserDto. password 는 서버에서 WRITE_ONLY 라 응답에 아예 없다.
 * 예전 스키마는 password 를 (nullable 이지만) 필수 키로 요구해 파싱이 항상 실패했고,
 * 카카오 가입 마지막 단계에서 사용자가 /signup 화면에 갇혔다.
 * 화면이 쓰지 않는 값은 서버가 빼거나 null 로 줘도 가입이 막히지 않게 느슨하게 받는다.
 */
export const kakaoRegistrationResponseSchema = z.object({
  id: z.number(),
  userId: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  birthDate: z.string().nullish(),
  gender: z.string().nullish(),
  address: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  profileImageUrl: z.string().nullish(),
  role: z.string(),
  isActive: z.boolean().nullish(),
  emailVerified: z.boolean().nullish(),
  registrationCompleted: z.boolean().nullish(),
  lastLoginAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
export type KakaoRegistrationResponse = z.infer<typeof kakaoRegistrationResponseSchema>
