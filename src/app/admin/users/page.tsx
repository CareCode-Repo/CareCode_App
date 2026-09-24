'use client'
import { ReactElement, useState } from 'react'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import RoleChangeDialog from '@/components/features/admin/RoleChangeDialog'
import { useAdminUsers, useUpdateAdminUser } from '@/queries/admin'
import { useUserProfile } from '@/queries/user'
import { AdminUser, USER_ROLE_LABEL } from '@/types/apis/admin'
import { formatDate } from '@/utils/date'

const ROLE_COLOR: Record<string, 'green' | 'blue' | 'purple' | 'white'> = {
  ADMIN: 'purple',
  CAREGIVER: 'blue',
  PARENT: 'green',
  GUEST: 'white',
}

const AdminUsersPage = (): ReactElement => {
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<AdminUser | null>(null)

  const { data: me } = useUserProfile()
  const { data, isLoading, isError, refetch } = useAdminUsers(page)
  const { mutate: updateUser, isPending, isError: isUpdateError } = useUpdateAdminUser()

  const users = data?.content ?? []

  if (isError) {
    return <ErrorView content="사용자 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !users.length ? (
        <EmptyState title="사용자가 없어요" />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`총 ${data?.totalElements ?? users.length}명`}
          </p>

          <ul className="flex flex-col gap-2">
            {users.map((user) => {
              // 본인 계정의 역할·상태를 스스로 바꾸면 관리자 권한을 잃고 잠길 수 있다.
              const isSelf = me?.id === user.id
              const isWithdrawn = !!user.deletedAt

              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip color={ROLE_COLOR[user.role ?? 'GUEST'] ?? 'white'}>
                      {USER_ROLE_LABEL[user.role ?? ''] ?? user.role ?? '역할 없음'}
                    </Chip>
                    <span className="text-b1-semibold truncate text-gray-800">
                      {user.name || '이름 없음'}
                    </span>
                    {isSelf && <Chip color="white">나</Chip>}
                    {isWithdrawn ? (
                      <Chip color="red">탈퇴</Chip>
                    ) : (
                      !user.isActive && <Chip color="red">정지</Chip>
                    )}
                  </div>

                  <span className="text-b2-regular truncate text-gray-600">
                    {user.email || '이메일 없음'}
                  </span>
                  <span className="text-c1-regular text-gray-500">
                    {`가입 ${formatDate(user.createdAt)} · 최근 로그인 ${formatDate(user.lastLoginAt)}`}
                  </span>

                  {isWithdrawn ? (
                    <p className="text-c1-regular text-gray-500">
                      {`${formatDate(user.deletedAt)} 탈퇴한 계정이에요.`}
                    </p>
                  ) : isSelf ? (
                    <p className="text-c1-regular text-gray-500">
                      본인 계정의 역할과 상태는 여기서 바꿀 수 없어요.
                    </p>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <Button
                        color="gray"
                        size="small"
                        disabled={isPending}
                        onClick={() => setEditing(user)}
                      >
                        역할 변경
                      </Button>
                      <Button
                        color={user.isActive ? 'red' : 'green'}
                        size="small"
                        disabled={isPending}
                        onClick={() =>
                          updateUser({ id: user.id, body: { isActive: !user.isActive } })
                        }
                      >
                        {user.isActive ? '계정 정지' : '정지 해제'}
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {!data?.last && (
            <Button color="gray" size="small" onClick={() => setPage((prev) => prev + 1)}>
              더 보기
            </Button>
          )}
        </>
      )}

      <RoleChangeDialog
        user={editing}
        isPending={isPending}
        isError={isUpdateError}
        onClose={() => setEditing(null)}
        onSubmit={(role) =>
          editing &&
          updateUser({ id: editing.id, body: { role } }, { onSuccess: () => setEditing(null) })
        }
      />
    </div>
  )
}

export default AdminUsersPage
