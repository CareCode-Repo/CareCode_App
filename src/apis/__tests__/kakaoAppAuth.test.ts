import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * 앱에서의 카카오 로그인 복귀 경로.
 *
 * 이 흐름은 기기에서만 끝까지 돌려볼 수 있어(시스템 브라우저 → 카카오 → 웹 콜백 → 딥링크)
 * 사람이 확인하기 가장 번거로운 자리다. 그중 문자열을 만들고 읽는 부분만이라도 묶어 둔다.
 * `state=app` 이 빠지면 웹 콜백이 앱에서 온 로그인을 알아보지 못하고, 그러면 사용자는
 * 브라우저에 로그인된 채 앱으로는 영영 돌아오지 못한다.
 */
const h = vi.hoisted(() => ({
  native: { value: false },
  opened: [] as string[],
}))

vi.mock('@/utils/native', () => ({
  isNativeApp: () => h.native.value,
  nativePlatform: () => (h.native.value ? 'android' : 'web'),
  isAndroid: () => h.native.value,
  isIOS: () => false,
}))

vi.mock('@capacitor/browser', () => ({
  Browser: {
    open: vi.fn(async ({ url }: { url: string }) => {
      h.opened.push(url)
    }),
    close: vi.fn(async () => undefined),
  },
}))

beforeEach(() => {
  vi.resetModules()
  h.native.value = false
  h.opened.length = 0
})

describe('앱으로 돌아올 주소 만들기', () => {
  it('인가 코드를 싣는다', async () => {
    const { buildKakaoAppRedirect } = await import('@/apis/kakaoAppAuth')

    expect(buildKakaoAppRedirect({ code: 'abc123' })).toBe(
      'com.carecode.app://oauth/kakao?code=abc123',
    )
  })

  it('코드가 없으면 실패를 실어 보낸다 — 앱이 마냥 기다리지 않게', async () => {
    const { buildKakaoAppRedirect } = await import('@/apis/kakaoAppAuth')

    expect(buildKakaoAppRedirect({ error: 'no_code' })).toBe(
      'com.carecode.app://oauth/kakao?error=no_code',
    )
  })

  it('특수문자가 든 코드도 그대로 복원된다', async () => {
    const { buildKakaoAppRedirect, readKakaoCodeFromDeepLink } = await import('@/apis/kakaoAppAuth')
    const code = 'a+b/c=d&e'

    expect(readKakaoCodeFromDeepLink(buildKakaoAppRedirect({ code }))).toBe(code)
  })
})

describe('딥링크에서 인가 코드 읽기', () => {
  it('우리 주소에서 코드를 꺼낸다', async () => {
    const { readKakaoCodeFromDeepLink } = await import('@/apis/kakaoAppAuth')

    expect(readKakaoCodeFromDeepLink('com.carecode.app://oauth/kakao?code=xyz')).toBe('xyz')
  })

  it('다른 앱이 보낸 주소는 건드리지 않는다', async () => {
    const { readKakaoCodeFromDeepLink } = await import('@/apis/kakaoAppAuth')

    expect(readKakaoCodeFromDeepLink('com.carecode.app://something/else?code=xyz')).toBeNull()
    expect(readKakaoCodeFromDeepLink('https://example.com/?code=xyz')).toBeNull()
  })

  it('코드 없이 돌아온 경우(취소 등)는 null', async () => {
    const { readKakaoCodeFromDeepLink } = await import('@/apis/kakaoAppAuth')

    expect(readKakaoCodeFromDeepLink('com.carecode.app://oauth/kakao?error=no_code')).toBeNull()
  })
})

describe('로그인 창 열기', () => {
  it('앱에서는 state=app 을 붙여 시스템 브라우저로 연다', async () => {
    h.native.value = true
    const { openKakaoLoginInBrowser, KAKAO_APP_STATE } = await import('@/apis/kakaoAppAuth')

    await openKakaoLoginInBrowser(
      'https://kauth.kakao.com/oauth/authorize?client_id=k&redirect_uri=https%3A%2F%2Fweb%2Fcb&response_type=code',
    )

    expect(h.opened).toHaveLength(1)
    const opened = new URL(h.opened[0])
    expect(opened.searchParams.get('state')).toBe(KAKAO_APP_STATE)
    // 서버가 만든 값은 하나도 잃지 않아야 한다.
    expect(opened.searchParams.get('client_id')).toBe('k')
    expect(opened.searchParams.get('redirect_uri')).toBe('https://web/cb')
    expect(opened.searchParams.get('response_type')).toBe('code')
  })

  it('웹에서는 아무것도 열지 않는다 — 현재 창을 그대로 보낸다', async () => {
    const { openKakaoLoginInBrowser } = await import('@/apis/kakaoAppAuth')

    await openKakaoLoginInBrowser('https://kauth.kakao.com/oauth/authorize?client_id=k')

    expect(h.opened).toHaveLength(0)
  })
})
