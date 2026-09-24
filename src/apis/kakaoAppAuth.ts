import { isNativeApp } from '@/utils/native'

/**
 * 앱에서의 카카오 로그인.
 *
 * 웹은 그냥 현재 창을 카카오로 보낸다. 앱에서는 그럴 수 없다 — WebView 를 카카오로 보내면
 * 주소창도 뒤로가기도 없는 화면에 갇히고, 무엇보다 **카카오가 인앱 브라우저 로그인을 막는다**
 * (애플도 OAuth 를 외부 브라우저에서 처리하도록 요구한다).
 *
 * 그래서 시스템 브라우저(Chrome Custom Tabs / SFSafariViewController)로 띄우고, 끝나면
 * 커스텀 스킴으로 앱을 다시 연다. 흐름은 이렇다.
 *
 *   1. 앱   : 인가 URL 에 `state=app` 을 붙여 시스템 브라우저로 연다
 *   2. 카카오: 로그인이 끝나면 서버에 등록된 redirect_uri(웹 콜백 주소)로 보낸다.
 *             `state` 는 그대로 실려 온다
 *   3. 웹   : 콜백 화면이 `state=app` 을 보고, 토큰을 받는 대신 인가 코드만 스킴으로 넘긴다
 *   4. 앱   : 딥링크로 다시 열리고, 받은 코드로 평소대로 로그인을 끝낸다
 *
 * `state` 를 쓰는 이유: 서버가 만드는 인가 URL 에는 `state` 가 없고(KakaoUtil), 카카오는
 * 받은 `state` 를 그대로 돌려준다. 덕분에 **서버도 카카오 콘솔도 고치지 않고** 앱에서 온
 * 로그인을 구분할 수 있다. redirect_uri 를 커스텀 스킴으로 바꾸는 방법도 있지만, 카카오
 * 콘솔의 Redirect URI 는 http/https 만 받는다.
 */

/** 카카오가 그대로 돌려주는 값. 웹 콜백이 "앱에서 시작한 로그인" 을 알아보는 표식이다. */
export const KAKAO_APP_STATE = 'app'

/** 로그인이 끝나면 이 주소로 앱이 다시 열린다(AndroidManifest / Info.plist 에 등록된 스킴). */
export const KAKAO_APP_REDIRECT = 'com.carecode.app://oauth/kakao'

/** 웹 콜백이 앱으로 돌려보낼 주소를 만든다. */
export const buildKakaoAppRedirect = (params: { code?: string; error?: string }): string => {
  const query = new URLSearchParams()
  if (params.code) query.set('code', params.code)
  if (params.error) query.set('error', params.error)
  return `${KAKAO_APP_REDIRECT}?${query.toString()}`
}

/** 딥링크로 돌아온 주소에서 인가 코드를 꺼낸다. 주소가 우리 것이 아니면 `null`. */
export const readKakaoCodeFromDeepLink = (url: string): string | null => {
  if (!url.startsWith(KAKAO_APP_REDIRECT)) return null
  const [, query = ''] = url.split('?')
  return new URLSearchParams(query).get('code')
}

/** 시스템 브라우저로 카카오 로그인을 연다. */
export const openKakaoLoginInBrowser = async (loginUrl: string): Promise<void> => {
  if (!isNativeApp()) return

  const url = new URL(loginUrl)
  url.searchParams.set('state', KAKAO_APP_STATE)

  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url: url.toString() })
}

/** 로그인 창을 닫는다. 이미 닫혀 있어도 문제되지 않는다. */
export const closeKakaoLoginBrowser = async (): Promise<void> => {
  if (!isNativeApp()) return

  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.close()
  } catch {
    // 사용자가 직접 닫았으면 여기로 온다. 할 일이 없다.
  }
}
