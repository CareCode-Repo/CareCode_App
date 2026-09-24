import { CareCode } from './interceptor'
import {
  PostLoginBody,
  PostLoginResponse,
  PostRefreshTokenResponse,
  postLoginBodySchema,
  postLoginResponseSchema,
  postRefreshTokenResponseSchema,
  getKakaoAuthUrlResponseSchema,
  GetKakaoAuthUrlResponse,
  postKakaoAuthBodySchema,
  PostKakaoAuthBody,
  postKakaoAuthResponseSchema,
  PostKakaoAuthResponse,
  kakaoRegistrationRequestSchema,
  KakaoRegistrationRequest,
  kakaoRegistrationResponseSchema,
  KakaoRegistrationResponse,
} from '@/types/apis/auth'

// /auth/login
export const postLogin = async (body: PostLoginBody): Promise<PostLoginResponse> => {
  const parsedBody = postLoginBodySchema.parse(body)
  const res = await CareCode.post('/auth/login', parsedBody)
  return postLoginResponseSchema.parse(res.data)
}

let refreshTimer: NodeJS.Timeout | null = null

/**
 * 액세스 토큰은 저장소가 아닌 모듈 메모리에 둔다.
 * 새로고침하면 사라지지만, HttpOnly 리프레시 쿠키로 세션을 복구한다(SessionBootstrap).
 */
let accessTokenInMemory: string | null = null

const USER_ID_KEY = 'userId'
const SESSION_FLAG_KEY = 'hasSession'

// 토큰 관리
export function setTokens(accessToken: string, userId: string, expiresIn: number): void {
  if (typeof window === 'undefined') return

  // 액세스 토큰은 메모리에만 둔다. 저장소에 남기면 XSS 로 그대로 읽힌다.
  accessTokenInMemory = accessToken
  sessionStorage.setItem(USER_ID_KEY, userId)
  // 리프레시 토큰은 서버가 HttpOnly 쿠키로 관리하므로 JS 로는 저장하지 않는다.
  // 새로고침 후 세션 복구를 시도해야 하는지 판단할 표시만 남긴다.
  localStorage.setItem(SESSION_FLAG_KEY, '1')

  // 이전 타이머 제거
  if (refreshTimer) clearTimeout(refreshTimer)

  // 자동 갱신: expiresIn(ms) 기준 30초 전
  const refreshTime = Math.max(expiresIn - 30_000, 10_000)
  refreshTimer = setTimeout(() => autoRefreshToken(), refreshTime)
}

export function getAccessToken(): string | null {
  return accessTokenInMemory
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(USER_ID_KEY)
}

/** 새로고침 등으로 메모리가 비었을 때 세션 복구를 시도해도 되는지 여부. */
export function hasStoredSession(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SESSION_FLAG_KEY) === '1'
}

export function clearTokens(): void {
  accessTokenInMemory = null
  if (refreshTimer) clearTimeout(refreshTimer)
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(SESSION_FLAG_KEY)
  // 예전 버전이 저장소에 남겨 둔 토큰이 있으면 함께 지운다.
  sessionStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

async function autoRefreshToken() {
  try {
    await refreshAccessToken()
  } catch (err) {
    console.error('자동 토큰 갱신 실패', err)
    clearTokens()
    window.location.href = '/'
  }
}

/**
 * 액세스 토큰 갱신.
 * 리프레시 토큰은 HttpOnly 쿠키로 자동 전송되므로 본문을 보내지 않는다.
 * (withCredentials 가 켜져 있어야 쿠키가 실린다)
 */
export async function refreshAccessToken(): Promise<PostRefreshTokenResponse> {
  const res = await CareCode.post('/auth/refresh')
  const parsed = postRefreshTokenResponseSchema.parse(res.data)

  setTokens(parsed.accessToken, parsed.user.userId, parsed.expiresIn)
  return parsed
}

// GET /auth/kakao/login-url - 카카오 인증 URL 요청
export const getKakaoAuthUrl = async (): Promise<GetKakaoAuthUrlResponse> => {
  const res = await CareCode.get('/auth/kakao/login-url')
  return getKakaoAuthUrlResponseSchema.parse(res.data)
}

// /api/auth/kakao/auth
export const postKakaoAuth = async (body: PostKakaoAuthBody): Promise<PostKakaoAuthResponse> => {
  const parsedBody = postKakaoAuthBodySchema.parse(body)

  const res = await CareCode.post('/auth/kakao/login', null, {
    params: { code: parsedBody.code },
  })

  // 토큰이 없으면 로그인이 끝난 게 아니다. 본문이 비어 있으면 스키마가 여기서 잡아낸다.
  return postKakaoAuthResponseSchema.parse(res.data)
}

// POST /users/auth/users/kakao/complete-registration
export const postKakaoCompleteRegistration = async (
  body: KakaoRegistrationRequest,
): Promise<KakaoRegistrationResponse> => {
  const parsedBody = kakaoRegistrationRequestSchema.parse(body)
  const res = await CareCode.post('/auth/kakao/complete-registration', parsedBody)
  return kakaoRegistrationResponseSchema.parse(res.data)
}
