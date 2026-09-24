import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ReviewForm from '@/components/features/facility/ReviewForm'

describe('ReviewForm', () => {
  it('별점과 내용이 모두 있어야 등록할 수 있다', async () => {
    render(<ReviewForm onSubmit={vi.fn()} />)

    const submit = screen.getByRole('button', { name: '리뷰 등록' })
    expect(submit).toBeDisabled()

    await userEvent.click(screen.getByRole('radio', { name: '4점' }))
    expect(submit).toBeDisabled()

    await userEvent.type(screen.getByRole('textbox'), '선생님이 친절했어요')
    expect(submit).toBeEnabled()
  })

  it('공백만 입력한 내용은 등록으로 보지 않는다', async () => {
    render(<ReviewForm onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('radio', { name: '5점' }))
    await userEvent.type(screen.getByRole('textbox'), '   ')

    expect(screen.getByRole('button', { name: '리뷰 등록' })).toBeDisabled()
  })

  it('제출하면 별점과 다듬은 내용을 넘긴다', async () => {
    const onSubmit = vi.fn()
    render(<ReviewForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('radio', { name: '5점' }))
    await userEvent.type(screen.getByRole('textbox'), '  아이가 좋아해요  ')
    await userEvent.click(screen.getByRole('button', { name: '리뷰 등록' }))

    expect(onSubmit).toHaveBeenCalledWith({ rating: 5, content: '아이가 좋아해요' })
  })

  it('제출 후에는 입력을 비워 같은 리뷰가 두 번 올라가지 않게 한다', async () => {
    render(<ReviewForm onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('radio', { name: '3점' }))
    await userEvent.type(screen.getByRole('textbox'), '보통이에요')
    await userEvent.click(screen.getByRole('button', { name: '리뷰 등록' }))

    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.getByRole('button', { name: '리뷰 등록' })).toBeDisabled()
  })

  it('전송 중에는 다시 제출할 수 없다', async () => {
    const onSubmit = vi.fn()
    render(<ReviewForm isPending onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('radio', { name: '5점' }))
    await userEvent.type(screen.getByRole('textbox'), '좋아요')

    const submit = screen.getByRole('button', { name: '등록 중...' })
    expect(submit).toBeDisabled()

    await userEvent.click(submit)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('선택한 별점이 접근성 상태로 드러난다', async () => {
    render(<ReviewForm onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('radio', { name: '4점' }))

    expect(screen.getByRole('radio', { name: '4점' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '5점' })).toHaveAttribute('aria-checked', 'false')
  })
})
