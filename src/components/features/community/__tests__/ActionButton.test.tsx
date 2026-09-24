import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ActionButton from '@/components/features/community/ActionButton'

describe('ActionButton', () => {
  it('개수를 함께 보여준다', () => {
    render(<ActionButton type="like" count={12} onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: '좋아요 12' })).toBeInTheDocument()
  })

  it('개수가 없으면 라벨만 보여준다', () => {
    // 북마크는 서버가 개수를 주지 않는 화면이 있어 숫자 없이 그려져야 한다.
    render(<ActionButton type="bookmark" onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: '북마크' })).toBeInTheDocument()
  })

  it('개수가 0 이어도 표시한다', () => {
    render(<ActionButton type="like" count={0} onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: '좋아요 0' })).toBeInTheDocument()
  })

  it('누른 상태를 접근성 속성으로 드러낸다', () => {
    render(<ActionButton type="like" count={1} active onClick={vi.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('클릭 핸들러가 없으면 눌리지 않는 표시 전용으로 동작한다', () => {
    // 댓글 수처럼 표시만 하는 경우 버튼처럼 보이면 안 된다.
    render(<ActionButton type="comment" count={3} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).not.toHaveAttribute('aria-pressed')
  })

  it('전송 중에는 중복 클릭이 막힌다', async () => {
    const onClick = vi.fn()
    render(<ActionButton type="like" count={1} disabled onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('클릭하면 핸들러가 호출된다', async () => {
    const onClick = vi.fn()
    render(<ActionButton type="like" count={1} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
