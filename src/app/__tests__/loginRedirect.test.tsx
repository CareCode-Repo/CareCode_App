import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * 로그인한 사용자는 로그인 화면에 머무르지 않는다.
 *
 * `SessionBootstrap` 이 부팅 때 세션을 되살려 두지만, 되살린 뒤에 어디로 갈지는 아무도
 * 정하지 않았었다. 웹에서는 주소를 직접 쳐서 `/` 로 들어온 경우라 덜 눈에 띄었지만,
 * **앱은 언제나 `/` 에서 시작한다** — 로그인해 둔 사용자가 앱을 켤 때마다 로그인 화면을
 * 보고 다시 로그인을 눌러야 했다. 기기에서 돌려 보고서야 드러난 종류의 버그라, 다시
 * 조용히 사라지지 않게 묶어 둔다.
 */
const h = vi.hoisted(() => ({
  token: { value: null as string | null },
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: h.replace, push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/apis/auth', () => ({ getAccessToken: () => h.token.value }))

vi.mock('@/queries/auth', () => ({
  useGetKakaoAuthUrlMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}))

// 로그인 화면이 들고 있는 나머지는 이 테스트의 관심사가 아니다.
vi.mock('@/apis/kakaoAppAuth', () => ({ openKakaoLoginInBrowser: vi.fn() }))
vi.mock('@/utils/native', () => ({
  isNativeApp: () => false,
  nativePlatform: () => 'web',
  isAndroid: () => false,
  isIOS: () => false,
}))
vi.mock('@/components/features/login/DevLoginButton', () => ({ default: () => null }))

beforeEach(() => {
  vi.clearAllMocks()
  h.token.value = null
})

describe('로그인 화면 진입', () => {
  it('로그인돼 있으면 홈으로 보낸다', async () => {
    h.token.value = 'access-token'
    const { default: Home } = await import('@/app/page')

    render(<Home />)

    await waitFor(() => expect(h.replace).toHaveBeenCalledWith('/home'))
  })

  it('로그인돼 있지 않으면 그대로 둔다', async () => {
    const { default: Home } = await import('@/app/page')

    render(<Home />)

    await waitFor(() => expect(h.replace).not.toHaveBeenCalled())
  })
})
