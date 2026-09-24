import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OfflineBanner from '@/components/common/OfflineBanner'

/**
 * 인터넷이 끊겼을 때의 동작.
 *
 * 이게 없으면 지하철·엘리베이터에서 앱을 연 사용자는 화면마다 "불러오지 못했어요" 만 보고
 * 앱이 고장났다고 생각한다. 그리고 연결이 돌아와도 **앱에는 새로고침 버튼이 없어서**
 * 스스로 되살릴 방법이 없다 — 돌아왔을 때 다시 불러오는 쪽이 조용히 빠지기 쉬워 묶어 둔다.
 */
const h = vi.hoisted(() => ({ native: { value: false } }))

vi.mock('@/utils/native', () => ({
  isNativeApp: () => h.native.value,
  nativePlatform: () => 'web',
  isAndroid: () => false,
  isIOS: () => false,
}))

const setBrowserOnline = (value: boolean): void => {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })
}

const renderBanner = (): { client: QueryClient } => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  render(
    <Wrapper>
      <OfflineBanner>
        <p>본문</p>
      </OfflineBanner>
    </Wrapper>,
  )

  return { client }
}

beforeEach(() => {
  h.native.value = false
  setBrowserOnline(true)
})

describe('오프라인 안내', () => {
  it('연결돼 있으면 아무것도 덧붙이지 않는다', async () => {
    renderBanner()

    await waitFor(() => expect(screen.getByText('본문')).toBeInTheDocument())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('끊기면 이유를 알려 준다', async () => {
    renderBanner()

    await act(async () => {
      setBrowserOnline(false)
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByRole('status')).toHaveTextContent('인터넷에 연결되어 있지 않아요')
    // 안내가 떠도 본문은 그대로 둔다 — 이미 받아 둔 화면까지 가릴 이유가 없다.
    expect(screen.getByText('본문')).toBeInTheDocument()
  })

  it('돌아오면 안내를 걷고 화면을 다시 불러온다', async () => {
    const { client } = renderBanner()
    const invalidate = vi.spyOn(client, 'invalidateQueries')

    await act(async () => {
      setBrowserOnline(false)
      window.dispatchEvent(new Event('offline'))
    })
    await act(async () => {
      setBrowserOnline(true)
      window.dispatchEvent(new Event('online'))
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    // 앱에는 새로고침 버튼이 없다. 여기서 다시 부르지 않으면 화면이 빈 채로 남는다.
    expect(invalidate).toHaveBeenCalled()
  })

  it('처음부터 온라인이면 괜히 다시 불러오지 않는다', async () => {
    const { client } = renderBanner()
    const invalidate = vi.spyOn(client, 'invalidateQueries')

    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })

    expect(invalidate).not.toHaveBeenCalled()
  })
})
