import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, refreshAccessToken, hasStoredSession, clearTokens } from './auth'
import { printErrorConsole, printRequestConsole, printResponseConsole } from '@/utils/console'

const isDevelopment = process.env.NODE_ENV === 'development' // 개발 단계인지 확인

/** 401을 받아도 갱신을 시도하면 안 되는 경로 (갱신 자체가 실패했을 때의 무한 루프 방지) */
const AUTH_ENDPOINTS = ['/auth/refresh', '/auth/login', '/auth/kakao/login', '/auth/register']

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export const CareCode: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: { Accept: '*/*' },
  withCredentials: true, // refreshToken은 HttpOnly 쿠키
})

// 요청 시 Authorization 헤더 적용
CareCode.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (isDevelopment) printRequestConsole(config)
  return config
})

/**
 * 여러 요청이 동시에 401을 받아도 갱신은 한 번만 나가도록 묶는다.
 * 진행 중인 갱신이 있으면 그 Promise를 재사용한다.
 */
let refreshPromise: Promise<string> | null = null

export const runRefresh = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      // 리프레시 토큰은 HttpOnly 쿠키라 JS 로 확인할 수 없다.
      // 로그인한 적이 있다는 표시가 없으면 굳이 서버를 왕복하지 않는다.
      if (!hasStoredSession()) throw new Error('No stored session')

      const { accessToken } = await refreshAccessToken()
      return accessToken
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

const redirectToLogin = (): void => {
  clearTokens()
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.href = '/' // 로그인 화면으로 이동
  }
}

// 401 발생 시 refresh + 재시도
CareCode.interceptors.response.use(
  (res: AxiosResponse) => {
    // 요청·에러와 마찬가지로 개발 환경에서만 찍는다.
    // 이 앱은 건강기록·개인정보를 다루므로 응답 본문이 프로덕션 콘솔에 남으면 안 된다.
    if (isDevelopment) printResponseConsole(res)
    return res
  },
  async (error) => {
    if (isDevelopment) printErrorConsole(error)

    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.includes(path))

    // 재시도는 요청당 한 번만. 갱신/로그인 API 자체의 401은 갱신 대상이 아니다.
    if (status !== 401 || !config || config._retry || isAuthEndpoint) {
      if (status === 401 && (isAuthEndpoint || config?._retry)) redirectToLogin()
      return Promise.reject(error)
    }

    config._retry = true

    try {
      const accessToken = await runRefresh()
      config.headers.Authorization = `Bearer ${accessToken}`
      return CareCode(config)
    } catch {
      redirectToLogin()
      return Promise.reject(error)
    }
  },
)
