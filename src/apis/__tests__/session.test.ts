import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * 앱에서의 로그인 유지.
 *
 * 웹은 HttpOnly 쿠키가 리프레시 토큰을 들고 있지만, 앱(WebView)에서는 그 쿠키가
 * 서드파티 쿠키가 되어 iOS 가 막는다. 그래서 앱만 토큰을 직접 보관하고 본문으로 보낸다.
 *
 * 여기가 틀리면 증상이 "이유 없이 로그아웃된다" 하나로만 나타나고, 그마저도 기기에서
 * 며칠 뒤에야 드러난다. 특히 서버가 갱신마다 토큰을 **교체**하므로, 새 토큰을 저장하지
 * 못하면 그다음 갱신부터 조용히 실패한다.
 */
const h = vi.hoisted(() => {
  const store = new Map<string, string>()
  return {
    store,
    native: { value: false },
    failReads: { value: false },
    secure: {
      getItem: vi.fn(async (key: string) => {
        if (h.failReads.value) throw new Error('기기 잠금')
        return store.get(key) ?? null
      }),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value)
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key)
      }),
    },
  }
})

vi.mock('@/utils/native', () => ({
  isNativeApp: () => h.native.value,
  nativePlatform: () => (h.native.value ? 'android' : 'web'),
  isAndroid: () => h.native.value,
  isIOS: () => false,
}))

/**
 * 실제 Capacitor 플러그인은 **Proxy** 라서 어떤 프로퍼티에 접근하든 네이티브 호출로 번역된다.
 * 그래서 플러그인 객체를 async 함수의 반환값으로 내보내면, JS 가 thenable 인지 확인하려고
 * `.then` 을 읽는 것만으로 `SecureStorage.then()` 이 호출되어 `not implemented` 로 터진다.
 * 평범한 객체로 목을 만들면 이 사고가 테스트를 그냥 통과한다 — 실제로 한 번 놓쳤다.
 */
vi.mock('@aparajita/capacitor-secure-storage', () => ({
  SecureStorage: new Proxy(h.secure, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver)
      throw new Error(`"SecureStorage.${String(prop)}()" is not implemented on android`)
    },
  }),
}))

/** 서버가 실제로 돌려주는 갱신 응답 모양(TokenDto). 신원은 최상위가 아니라 user 안에 있다. */
const refreshResponse = (accessToken: string, refreshToken?: string | null) => ({
  accessToken,
  ...(refreshToken === undefined ? {} : { refreshToken }),
  tokenType: 'Bearer',
  expiresIn: 60_000,
  success: true,
  user: { id: 1, userId: 'user-1', email: 'dev@carecode.local', name: '개발계정', role: 'PARENT' },
})

beforeEach(() => {
  vi.resetModules()
  h.store.clear()
  h.native.value = false
  h.failReads.value = false
  localStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('리프레시 토큰 보관', () => {
  it('웹에서는 네이티브 저장소를 건드리지 않는다', async () => {
    const session = await import('@/apis/session')

    expect(session.usesStoredRefreshToken()).toBe(false)
    await session.saveRefreshToken('refresh-1')

    expect(h.secure.setItem).not.toHaveBeenCalled()
    expect(await session.loadRefreshToken()).toBeNull()
  })

  it('앱에서는 저장했다가 다시 켜도 읽힌다', async () => {
    h.native.value = true

    const first = await import('@/apis/session')
    await first.saveRefreshToken('refresh-1')
    expect(h.secure.setItem).toHaveBeenCalledWith('carecode.refreshToken', 'refresh-1')

    // 앱을 다시 켠 상황: 메모리 사본이 사라지고 저장소만 남는다.
    vi.resetModules()
    const restarted = await import('@/apis/session')

    expect(restarted.getRefreshToken()).toBeNull()
    expect(await restarted.loadRefreshToken()).toBe('refresh-1')
    expect(restarted.getRefreshToken()).toBe('refresh-1')
  })

  it('저장소를 읽지 못해도 터지지 않고 "토큰 없음" 으로 본다', async () => {
    h.native.value = true
    h.failReads.value = true

    const session = await import('@/apis/session')

    await expect(session.loadRefreshToken()).resolves.toBeNull()
  })

  it('지우면 저장소에서도 사라진다', async () => {
    h.native.value = true

    const session = await import('@/apis/session')
    await session.saveRefreshToken('refresh-1')
    await session.clearRefreshToken()

    expect(session.getRefreshToken()).toBeNull()
    expect(h.store.has('carecode.refreshToken')).toBe(false)
  })
})

describe('앱에서의 세션 판단과 갱신', () => {
  it('앱에서는 저장된 토큰이 세션의 근거다 (쿠키 표시가 아니라)', async () => {
    h.native.value = true

    const [auth, session] = await Promise.all([import('@/apis/auth'), import('@/apis/session')])

    // 웹이라면 이 표시만으로 세션이 있다고 판단하지만, 앱에서는 아니다.
    localStorage.setItem('hasSession', '1')
    expect(auth.hasStoredSession()).toBe(false)

    await session.saveRefreshToken('refresh-1')
    expect(auth.hasStoredSession()).toBe(true)
  })

  it('앱은 갱신 요청 본문에 토큰을 싣는다', async () => {
    h.native.value = true

    const [auth, session, interceptor] = await Promise.all([
      import('@/apis/auth'),
      import('@/apis/session'),
      import('@/apis/interceptor'),
    ])
    const mock = new MockAdapter(interceptor.CareCode)
    await session.saveRefreshToken('refresh-1')

    let sentBody: unknown = null
    mock.onPost('/auth/refresh').reply((config) => {
      sentBody = JSON.parse(config.data as string)
      return [200, refreshResponse('access-2', 'refresh-2')]
    })

    await auth.refreshAccessToken()

    expect(sentBody).toEqual({ refreshToken: 'refresh-1' })
    mock.restore()
  })

  it('교체된 리프레시 토큰을 저장한다 — 빠뜨리면 다음 갱신부터 로그아웃된다', async () => {
    h.native.value = true

    const [auth, session, interceptor] = await Promise.all([
      import('@/apis/auth'),
      import('@/apis/session'),
      import('@/apis/interceptor'),
    ])
    const mock = new MockAdapter(interceptor.CareCode)
    await session.saveRefreshToken('refresh-1')

    mock.onPost('/auth/refresh').reply(200, refreshResponse('access-2', 'refresh-2'))
    await auth.refreshAccessToken()

    expect(session.getRefreshToken()).toBe('refresh-2')
    expect(h.store.get('carecode.refreshToken')).toBe('refresh-2')
    mock.restore()
  })

  it('갱신 응답에 토큰이 없으면 들고 있던 것을 유지한다', async () => {
    h.native.value = true

    const [auth, session, interceptor] = await Promise.all([
      import('@/apis/auth'),
      import('@/apis/session'),
      import('@/apis/interceptor'),
    ])
    const mock = new MockAdapter(interceptor.CareCode)
    await session.saveRefreshToken('refresh-1')

    // 쿠키만 쓰던 시절의 서버 응답. 파싱이 깨지지 않아야 한다.
    mock.onPost('/auth/refresh').reply(200, refreshResponse('access-2'))
    await auth.refreshAccessToken()

    expect(session.getRefreshToken()).toBe('refresh-1')
    mock.restore()
  })

  it('웹은 갱신 요청에 본문을 싣지 않는다 — 쿠키가 실린다', async () => {
    const [auth, interceptor] = await Promise.all([
      import('@/apis/auth'),
      import('@/apis/interceptor'),
    ])
    const mock = new MockAdapter(interceptor.CareCode)

    let sentData: unknown = 'not-called'
    mock.onPost('/auth/refresh').reply((config) => {
      sentData = config.data
      return [200, refreshResponse('access-2', 'refresh-2')]
    })

    await auth.refreshAccessToken()

    expect(sentData).toBeUndefined()
    expect(h.secure.setItem).not.toHaveBeenCalled()
    mock.restore()
  })
})
