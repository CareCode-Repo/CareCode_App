'use client'
import { ReactElement, useState } from 'react'
import { getErrorMessage } from '@/apis/errors'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import { useBlockedUsers, useUnblockUser } from '@/queries/moderation'

const BlockedUsersContent = (): ReactElement => {
  const { data: blockedIds = [], isLoading, isError, refetch } = useBlockedUsers()
  const { mutate: unblock, isPending, variables, isError: isUnblockError, error } = useUnblockUser()
  const [target, setTarget] = useState<number | null>(null)

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-3 px-4.5">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </ul>
    )
  }

  if (isError) {
    return <ErrorView content="차단 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  if (blockedIds.length === 0) {
    return (
      <EmptyState
        title="차단한 사용자가 없어요"
        description={'게시글이나 댓글에서 차단하면\n그 사용자의 글이 목록에 보이지 않아요.'}
      />
    )
  }

  return (
    <>
      <p className="text-b2-regular px-4.5 pb-4 text-gray-600">
        차단한 사용자의 글과 댓글은 목록에서 보이지 않아요. 차단을 풀면 다시 보입니다.
      </p>

      {isUnblockError && (
        <p className="text-red text-b2-regular px-4.5 pb-3" role="alert">
          {getErrorMessage(error, '차단을 풀지 못했어요. 잠시 후 다시 시도해주세요.')}
        </p>
      )}

      <ul className="flex flex-col divide-y divide-gray-200 border-t border-gray-200 bg-white">
        {blockedIds.map((userId) => (
          <li key={userId} className="flex items-center justify-between px-4.5 py-4">
            {/*
              서버가 주는 것은 사용자 ID 뿐이라(GET /community/blocks → List<Long>)
              이름을 보여줄 수 없다. 없는 정보를 지어내지 않고 식별자를 그대로 보여준다.
            */}
            <span className="text-b1-medium text-gray-800">사용자 #{userId}</span>
            <button
              type="button"
              onClick={() => setTarget(userId)}
              disabled={isPending && variables === userId}
              className="text-b2-regular rounded border border-gray-300 px-3 py-1.5 text-gray-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none disabled:opacity-60"
            >
              {isPending && variables === userId ? '해제 중...' : '차단 해제'}
            </button>
          </li>
        ))}
      </ul>

      <AlertDialog
        title="차단을 풀까요?"
        description="이 사용자의 글과 댓글이 다시 목록에 보여요."
        isOpen={target !== null}
        onClose={() => setTarget(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setTarget(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color="green"
            size="small"
            onClick={() => {
              if (target !== null) unblock(target)
              setTarget(null)
            }}
          >
            차단 해제
          </Button>
        }
      />
    </>
  )
}

const BlockedUsersPage = (): ReactElement => (
  <AuthGuard>
    <Layout hasTopNav hasBackButton title="차단한 사용자" contentClassName="py-5">
      <BlockedUsersContent />
    </Layout>
  </AuthGuard>
)

export default BlockedUsersPage
