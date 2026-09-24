'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ReactElement, useEffect, useState } from 'react'
import Button from '@/components/common/Button'
import ToggleChip from '@/components/common/ToggleChip'
import { AdminUser, USER_ROLE_LABEL, UserRole } from '@/types/apis/admin'

interface RoleChangeDialogProps {
  /** null 이면 닫힌 상태 */
  user: AdminUser | null
  isPending?: boolean
  isError?: boolean
  onClose: () => void
  onSubmit: (role: UserRole) => void
}

const RoleChangeDialog = ({
  user,
  isPending = false,
  isError = false,
  onClose,
  onSubmit,
}: RoleChangeDialogProps): ReactElement => {
  const [role, setRole] = useState<UserRole | null>(null)

  // 다른 사용자를 열 때 이전 선택이 남아 있으면 잘못 바꿀 수 있다.
  useEffect(() => {
    setRole((user?.role as UserRole) ?? null)
  }, [user])

  const isAdminPromotion = role === 'ADMIN' && user?.role !== 'ADMIN'
  const canSubmit = !!role && role !== user?.role && !isPending

  return (
    <Dialog.Root open={!!user} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-black/65" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-20 w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5">
          <Dialog.Title className="text-t1-semibold text-gray-800">역할 변경</Dialog.Title>
          <Dialog.Description className="text-b2-regular mt-1 mb-4 truncate text-gray-600">
            {user?.name || user?.email || '사용자'}
          </Dialog.Description>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(USER_ROLE_LABEL) as UserRole[]).map((option) => (
              <ToggleChip
                key={option}
                pressed={role === option}
                onPressedChange={() => setRole(option)}
              >
                {USER_ROLE_LABEL[option]}
              </ToggleChip>
            ))}
          </div>

          {/* 관리자 승격은 되돌리기 전까지 모든 관리 기능이 열린다. 한 번 더 알린다. */}
          {isAdminPromotion && (
            <p className="text-b2-regular text-red mt-4">
              관리자로 올리면 사용자 정보와 신고 처리 등 모든 관리 기능에 접근할 수 있어요.
            </p>
          )}

          {isError && (
            <p className="text-red text-b2-regular mt-3" role="alert">
              변경에 실패했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <Button color="gray" size="small" onClick={onClose}>
              취소
            </Button>
            <Button
              color="green"
              size="small"
              disabled={!canSubmit}
              onClick={() => role && onSubmit(role)}
            >
              {isPending ? '변경 중...' : '변경'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default RoleChangeDialog
