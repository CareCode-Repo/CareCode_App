import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RoleChangeDialog from '@/components/features/admin/RoleChangeDialog'
import { AdminUser } from '@/types/apis/admin'

const parentUser: AdminUser = {
  id: 1,
  userId: 'u-1',
  email: 'parent@example.com',
  name: '김부모',
  phoneNumber: null,
  role: 'PARENT',
  isActive: true,
  emailVerified: true,
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00',
  deletedAt: null,
}

describe('RoleChangeDialog', () => {
  it('user 가 null 이면 열리지 않는다', () => {
    render(<RoleChangeDialog user={null} onClose={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.queryByText('역할 변경')).not.toBeInTheDocument()
  })

  it('현재 역할이 미리 선택돼 있고 그대로면 저장할 수 없다', () => {
    // 같은 값으로 저장하면 의미 없는 요청이 나간다.
    render(<RoleChangeDialog user={parentUser} onClose={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.getByRole('button', { name: '부모' })).toHaveAttribute('data-state', 'on')
    expect(screen.getByRole('button', { name: '변경' })).toBeDisabled()
  })

  it('다른 역할을 고르면 저장할 수 있다', async () => {
    const onSubmit = vi.fn()
    render(<RoleChangeDialog user={parentUser} onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: '보육사' }))
    await userEvent.click(screen.getByRole('button', { name: '변경' }))

    expect(onSubmit).toHaveBeenCalledWith('CAREGIVER')
  })

  it('관리자로 올릴 때는 권한 범위를 경고한다', async () => {
    render(<RoleChangeDialog user={parentUser} onClose={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.queryByText(/모든 관리 기능에 접근/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '관리자' }))

    expect(screen.getByText(/모든 관리 기능에 접근/)).toBeInTheDocument()
  })

  it('이미 관리자인 사용자에게는 승격 경고를 띄우지 않는다', () => {
    render(
      <RoleChangeDialog
        user={{ ...parentUser, role: 'ADMIN' }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.queryByText(/모든 관리 기능에 접근/)).not.toBeInTheDocument()
  })

  it('전송 중에는 중복 저장이 막힌다', async () => {
    const onSubmit = vi.fn()
    render(<RoleChangeDialog user={parentUser} isPending onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: '관리자' }))
    const submit = screen.getByRole('button', { name: '변경 중...' })

    expect(submit).toBeDisabled()
    await userEvent.click(submit)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
