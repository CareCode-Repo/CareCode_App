import { isNativeApp } from '@/utils/native'

/**
 * 앱에서의 리프레시 토큰 보관.
 *
 * 웹은 이 파일을 거의 쓰지 않는다. 서버가 HttpOnly 쿠키로 리프레시 토큰을 관리하고,
 * JS 는 그 존재조차 모른다 — XSS 로 훔칠 수 없다는 뜻이라 웹에서는 그게 가장 안전하다.
 *
 * 앱에서는 그 방식이 통하지 않는다. WebView 의 출처는 `https://localhost`(안드로이드) 나
 * `capacitor://localhost`(iOS) 라서 API 서버로 가는 쿠키가 **서드파티 쿠키**가 되고,
 * iOS WKWebView 는 이를 기본 차단한다. 쿠키에 기대면 iOS 에서 로그인이 유지되지 않는다.
 *
 * 그래서 앱에서는 응답 본문의 리프레시 토큰을 받아 직접 보관하고, 갱신할 때 본문으로 보낸다.
 * 서버는 이미 이 방식을 받아들인다(쿠키를 먼저 보고, 없으면 본문에서 읽는다).
 *
 * 저장소는 Keychain(iOS) · EncryptedSharedPreferences(Android) 다. `@capacitor/preferences`
 * 는 암호화되지 않아(UserDefaults · SharedPreferences) 이 값에는 쓰지 않는다.
 */

const KEY = 'carecode.refreshToken'

/**
 * 동기 접근용 메모리 사본.
 *
 * 네이티브 저장소 읽기는 비동기인데, `hasStoredSession()` 같은 판단은 인터셉터 안에서
 * 동기로 일어난다. 부팅 때 한 번 읽어 올려 두고 그 뒤로는 메모리를 본다.
 */
let cached: string | null = null
let isLoaded = false

/** 리프레시 토큰을 직접 들고 있어야 하는 환경인지. */
export const usesStoredRefreshToken = (): boolean => isNativeApp()

/**
 * 네이티브 전용 모듈이라 지연 import 한다. 정적으로 부르면 브라우저 번들에 실린다.
 *
 * **플러그인 객체를 async 함수의 반환값으로 내보내지 말 것.** Capacitor 플러그인은 Proxy 라
 * 모든 프로퍼티 접근이 네이티브 호출로 번역된다. async 함수가 이 객체를 반환하면 JS 가
 * "thenable 인가" 를 확인하려고 `.then` 에 접근하고, 그게 `SecureStorage.then()` 호출이 되어
 * `not implemented on android` 로 터진다. 모듈(진짜 Promise)만 await 하고 객체는 꺼내 쓴다.

/**
 * 앱 부팅 시 한 번. 저장된 토큰을 메모리로 올린다.
 * 읽기에 실패하면(기기 잠금 등) 토큰이 없는 것으로 본다 — 최악이 재로그인이라 안전한 쪽이다.
 */
export const loadRefreshToken = async (): Promise<string | null> => {
  if (!usesStoredRefreshToken()) return null
  if (isLoaded) return cached

  try {
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage')
    cached = await SecureStorage.getItem(KEY)
  } catch {
    cached = null
  }

  isLoaded = true
  return cached
}

export const getRefreshToken = (): string | null => cached

/**
 * 토큰을 갈아 끼운다.
 *
 * 서버는 갱신할 때마다 리프레시 토큰을 **교체**하고 이전 토큰을 폐기한다. 새 토큰을
 * 저장하지 못하면 다음 갱신이 실패해 사용자가 로그아웃된다. 그래서 갱신 응답에 토큰이
 * 실려 오면 반드시 이 함수를 거친다.
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  // 웹에서는 아무것도 하지 않는다. 쿠키가 들고 있고, JS 메모리에 두면 XSS 표면만 넓어진다.
  if (!usesStoredRefreshToken()) return

  cached = token
  isLoaded = true

  try {
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage')
    await SecureStorage.setItem(KEY, token)
  } catch {
    // 저장에 실패해도 이번 세션은 메모리 사본으로 이어진다. 앱을 다시 켜면 재로그인.
  }
}

export const clearRefreshToken = async (): Promise<void> => {
  cached = null
  isLoaded = true
  if (!usesStoredRefreshToken()) return

  try {
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage')
    await SecureStorage.removeItem(KEY)
  } catch {
    // 지우지 못해도 메모리에서는 사라졌다. 서버 쪽 토큰도 로그아웃 API 가 폐기한다.
  }
}
