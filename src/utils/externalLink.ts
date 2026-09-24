import { isNativeApp } from './native'

/**
 * 앱·사이트 밖으로 나가는 주소를 연다.
 *
 * 웹에서는 새 탭이면 충분하다. 앱에서는 그렇지 않다 — WebView 안에서 외부 주소로 이동하면
 * 주소창도 뒤로가기도 없는 화면에 갇히고, `target="_blank"` 는 WebView 설정에 따라
 * **아무 일도 일어나지 않는다**(새 창을 열 수 없어 클릭이 그냥 먹힌다).
 *
 * 그래서 앱에서는 인앱 브라우저(Chrome Custom Tabs / SFSafariViewController)로 연다.
 * 시스템 브라우저로 완전히 내보내는 것보다 낫다 — 닫기 버튼 하나로 앱에 돌아오고,
 * 사용자가 앱을 떠났다고 느끼지 않는다.
 *
 * 지원금 "신청하기" 가 대표적인 자리다. 이게 동작하지 않으면 이 서비스의 핵심 전환
 * (지원금을 실제로 신청하게 만드는 것)이 앱에서만 통째로 막힌다.
 */
export const openExternal = async (url: string): Promise<void> => {
  if (!isNativeApp()) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url })
}
