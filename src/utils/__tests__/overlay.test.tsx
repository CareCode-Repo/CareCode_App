import { render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import AlertDialog from '@/components/common/AlertDialog'
import { closeTopmostOverlay } from '@/utils/overlay'

/**
 * 안드로이드 뒤로 가기로 창 닫기.
 *
 * 이 판단은 **Radix 의 마크업에 기댄다**(`[data-state="open"][role="alertdialog"]` 등).
 * 그래서 DOM 을 손으로 만들어 검사하면 의미가 없다 — Radix 가 마크업을 바꾸거나 우리가
 * 다른 종류의 창을 새로 들였을 때 바로 그 변화를 놓치기 때문이다. 실제 컴포넌트를 띄워서 본다.
 *
 * 여기가 조용히 깨지면 증상은 "확인창이 떠 있는데 뒤로 가기를 누르면 앱이 내려간다" 이다.
 */
const DialogHarness = (): ReturnType<typeof AlertDialog> => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="로그아웃 할까요?"
      description="다시 로그인하면 이어서 이용할 수 있어요."
    />
  )
}

describe('열린 창 닫기', () => {
  it('떠 있는 창이 없으면 아무것도 하지 않는다', () => {
    render(<p>본문</p>)

    // false 를 돌려줘야 호출부가 "그럼 화면을 옮기자" 로 넘어간다.
    expect(closeTopmostOverlay()).toBe(false)
  })

  it('실제 AlertDialog 가 떠 있으면 찾아서 닫는다', async () => {
    render(<DialogHarness />)

    await waitFor(() => expect(screen.getByText('로그아웃 할까요?')).toBeInTheDocument())

    expect(closeTopmostOverlay()).toBe(true)

    // Esc 를 쏘면 Radix 가 자기 길로 닫는다 — 상태를 직접 건드리지 않는다.
    await waitFor(() => expect(screen.queryByText('로그아웃 할까요?')).not.toBeInTheDocument())
  })

  it('닫힌 뒤에는 다시 false 가 된다 — 그래야 다음 뒤로 가기가 화면을 옮긴다', async () => {
    render(<DialogHarness />)

    await waitFor(() => expect(screen.getByText('로그아웃 할까요?')).toBeInTheDocument())
    closeTopmostOverlay()
    await waitFor(() => expect(screen.queryByText('로그아웃 할까요?')).not.toBeInTheDocument())

    expect(closeTopmostOverlay()).toBe(false)
  })
})
