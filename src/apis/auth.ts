import { CareCode } from './interceptor'
import {
  clearRefreshToken,
  getRefreshToken,
  saveRefreshToken,
  usesStoredRefreshToken,
} from './session'
import {
  PostLoginBody,
  PostLoginResponse,
  PostRefreshTokenResponse,
  postLoginBodySchema,
  postLoginResponseSchema,
  postRefreshTokenBodySchema,
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
import { setErrorReportingUser } from '@/utils/errorReporting'

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
  // 오류를 누가 겪었는지 알 수 있게 아이디만 붙인다(이메일·이름은 보내지 않는다).
  setErrorReportingUser(userId)
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
  // 앱에는 쿠키가 없다. 저장해 둔 리프레시 토큰이 곧 "로그인한 적이 있다" 는 증거다.
  // (메모리 사본을 본다. 부팅 때 loadRefreshToken 이 먼저 올려 둔다 — SessionBootstrap)
  if (usesStoredRefreshToken()) return getRefreshToken() !== null
  return localStorage.getItem(SESSION_FLAG_KEY) === '1'
}

export function clearTokens(): void {
  accessTokenInMemory = null
  if (refreshTimer) clearTimeout(refreshTimer)
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(SESSION_FLAG_KEY)
  void clearRefreshToken()
  setErrorReportingUser(null)
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
 *
 * 웹: 리프레시 토큰이 HttpOnly 쿠키로 자동 전송된다(withCredentials 가 켜져 있어야 실린다).
 * 앱: 그 쿠키는 WebView 에서 서드파티 쿠키가 되어 iOS 가 막는다. 저장해 둔 토큰을 본문으로
 *     보내고, 응답으로 교체된 토큰을 받아 다시 저장한다.
 */
export async function refreshAccessToken(): Promise<PostRefreshTokenResponse> {
  // 웹은 본문 없이 보낸다 — 쿠키가 알아서 실린다.
  // 앱은 그 쿠키가 iOS 에서 차단되므로 저장해 둔 토큰을 본문에 싣는다.
  const storedToken = usesStoredRefreshToken() ? getRefreshToken() : null
  const body = storedToken
    ? postRefreshTokenBodySchema.parse({ refreshToken: storedToken })
    : undefined

  const res = await CareCode.post('/auth/refresh', body)
  const parsed = postRefreshTokenResponseSchema.parse(res.data)

  setTokens(parsed.accessToken, parsed.user.userId, parsed.expiresIn)

  // 교체된 토큰의 저장은 **기다린다**. 던져 두면 여기서 앱이 종료됐을 때 디스크에는 옛 토큰이
  // 남고, 서버는 그것을 이미 폐기한 뒤다 — 다음 실행에서 이유 없이 로그아웃된다.
  if (parsed.refreshToken) await saveRefreshToken(parsed.refreshToken)

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
