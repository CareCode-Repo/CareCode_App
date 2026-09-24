import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTokens, getAccessToken, setTokens } from '@/apis/auth'
import { CareCode, runRefresh } from '@/apis/interceptor'

/**
 * 401 → 갱신 → 재시도 경로.
 *
 * 이 앱에서 가장 조용히 틀리기 쉬운 곳이다. 갱신이 요청 수만큼 나가거나, 재시도가 무한히
 * 돌거나, 갱신 실패를 붙잡지 못하면 사용자는 이유 없이 로그아웃된다.
 */
/**
 * 서버가 실제로 돌려주는 갱신 응답 모양.
 * 최상위 userId/email/role 은 채워지지 않고 신원은 user 안에 있다(TokenDto).
 */
const refreshResponse = (accessToken: string) => ({
  accessToken,
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  expiresIn: 60_000,
  refreshExpiresIn: 2_592_000_000,
  userId: null,
  email: null,
  role: null,
  success: true,
  message: '토큰 갱신 성공!',
  user: { id: 1, userId: 'user-1', email: 'dev@carecode.local', name: '개발계정', role: 'PARENT' },
})

describe('CareCode 인터셉터', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(CareCode)
    clearTokens()
    // 세션이 있었다는 표시가 없으면 갱신을 시도조차 하지 않는다.
    localStorage.setItem('hasSession', '1')
    // 리다이렉트가 실제로 페이지를 옮기지 않도록 막는다.
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      pathname: '/home',
      href: '',
    } as unknown as Location)
  })

  afterEach(() => {
    mock.restore()
    clearTokens()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('메모리에 토큰이 있으면 Authorization 을 붙인다', async () => {
    setTokens('token-1', 'user-1', 60_000)

    mock.onGet('/users/me').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer token-1')
      return [200, { ok: true }]
    })

    await CareCode.get('/users/me')
  })

  it('401 을 받으면 갱신한 토큰으로 원 요청을 한 번 재시도한다', async () => {
    setTokens('stale', 'user-1', 60_000)

    let attempt = 0
    mock.onGet('/children').reply((config) => {
      attempt += 1
      if (attempt === 1) return [401, { message: 'expired' }]
      expect(config.headers?.Authorization).toBe('Bearer fresh')
      return [200, [{ childId: 1 }]]
    })
    mock.onPost('/auth/refresh').reply(200, refreshResponse('fresh'))

    const res = await CareCode.get('/children')

    expect(attempt).toBe(2)
    expect(res.data).toEqual([{ childId: 1 }])
    expect(getAccessToken()).toBe('fresh')
  })

  it('동시에 401 을 받아도 갱신은 한 번만 나간다 (single-flight)', async () => {
    setTokens('stale', 'user-1', 60_000)

    let refreshCalls = 0
    const attempts: Record<string, number> = { '/children': 0, '/health/records': 0 }

    for (const url of Object.keys(attempts)) {
      mock.onGet(url).reply(() => {
        attempts[url] += 1
        return attempts[url] === 1 ? [401, {}] : [200, { url }]
      })
    }
    mock.onPost('/auth/refresh').reply(() => {
      refreshCalls += 1
      return [200, refreshResponse('fresh')]
    })

    await Promise.all([CareCode.get('/children'), CareCode.get('/health/records')])

    expect(refreshCalls).toBe(1)
  })

  it('재시도한 요청이 또 401 이면 다시 갱신하지 않는다 (무한 루프 방지)', async () => {
    setTokens('stale', 'user-1', 60_000)

    let refreshCalls = 0
    mock.onGet('/children').reply(401, {})
    mock.onPost('/auth/refresh').reply(() => {
      refreshCalls += 1
      return [200, refreshResponse('fresh')]
    })

    await expect(CareCode.get('/children')).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(refreshCalls).toBe(1)
  })

  it('갱신 자체가 401 이면 갱신을 시도하지 않고 세션을 비운다', async () => {
    setTokens('stale', 'user-1', 60_000)
    mock.onPost('/auth/refresh').reply(401, {})

    await expect(CareCode.post('/auth/refresh')).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(getAccessToken()).toBeNull()
    expect(localStorage.getItem('hasSession')).toBeNull()
  })

  it('401 이 아닌 오류는 갱신 없이 그대로 던진다', async () => {
    setTokens('token-1', 'user-1', 60_000)

    let refreshCalls = 0
    mock.onGet('/children').reply(500, { message: 'boom' })
    mock.onPost('/auth/refresh').reply(() => {
      refreshCalls += 1
      return [200, {}]
    })

    await expect(CareCode.get('/children')).rejects.toMatchObject({
      response: { status: 500 },
    })
    expect(refreshCalls).toBe(0)
    expect(getAccessToken()).toBe('token-1')
  })

  it('로그인 이력이 없으면 서버를 왕복하지 않고 갱신을 포기한다', async () => {
    localStorage.removeItem('hasSession')

    let refreshCalls = 0
    mock.onPost('/auth/refresh').reply(() => {
      refreshCalls += 1
      return [200, {}]
    })

    await expect(runRefresh()).rejects.toThrow('No stored session')
    expect(refreshCalls).toBe(0)
  })
})
