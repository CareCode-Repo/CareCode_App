'use client'
import { ReactElement, useState } from 'react'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import PolicyFormDialog, {
  toFormValues,
  toPolicyBody,
  toPolicyPatchBody,
} from '@/components/features/admin/PolicyFormDialog'
import {
  useAdminPolicies,
  useCreateAdminPolicy,
  useDeleteAdminPolicy,
  useUpdateAdminPolicy,
  useUnverifyPolicy,
  useVerifyPolicy,
} from '@/queries/admin'
import { AdminPolicyDetail } from '@/types/apis/admin'
import { formatDate } from '@/utils/date'
import { formatAmount } from '@/utils/money'

/** 신청 기간 표시. 서버가 합쳐 주지 않으므로 화면에서 만든다. */
const formatPeriod = (start?: string | null, end?: string | null): string => {
  if (!start && !end) return '상시'
  if (!start) return `~ ${formatDate(end)}`
  if (!end) return `${formatDate(start)} ~`
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

const AdminPolicyManagePage = (): ReactElement => {
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<AdminPolicyDetail | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminPolicyDetail | null>(null)

  const { data, isLoading, isError, refetch } = useAdminPolicies(page)
  const {
    mutate: createPolicy,
    isPending: isCreatePending,
    isError: isCreateError,
  } = useCreateAdminPolicy()
  const {
    mutate: updatePolicy,
    isPending: isUpdatePending,
    isError: isUpdateError,
  } = useUpdateAdminPolicy()
  const { mutate: deletePolicy, isPending: isDeletePending } = useDeleteAdminPolicy()
  const { mutate: verifyPolicy, isPending: isVerifying } = useVerifyPolicy()
  const { mutate: unverifyPolicy, isPending: isUnverifying } = useUnverifyPolicy()

  const policies = data?.content ?? []

  if (isError) {
    return <ErrorView content="정책 목록을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-c1-regular text-gray-600">
        정책은 해마다 바뀝니다. 여기서 고치면 재배포 없이 사용자 화면에 반영돼요.
      </p>

      <Button color="green" size="small" onClick={() => setIsCreating(true)}>
        새 정책 등록
      </Button>

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : !policies.length ? (
        <EmptyState title="등록된 정책이 없어요" />
      ) : (
        <>
          <p className="text-b2-regular text-gray-600">
            {`총 ${data?.totalElements ?? policies.length}건`}
          </p>

          <ul className="flex flex-col gap-2">
            {policies.map((policy) => (
              <li
                key={policy.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {policy.isActive === false && <Chip color="red">비노출</Chip>}
                  {/* 검증 여부는 사용자 화면의 금액 신뢰도 표기와 직결된다 */}
                  {policy.verifiedAt ? (
                    <Chip color="green">검증됨</Chip>
                  ) : (
                    <Chip color="yellow">추정</Chip>
                  )}
                  {policy.policyCategoryName && (
                    <Chip color="white">{policy.policyCategoryName}</Chip>
                  )}
                  <span className="text-b1-semibold truncate text-gray-800">{policy.title}</span>
                </div>

                <span className="text-b2-regular text-gray-700">
                  {formatAmount(policy.benefitAmount)}
                </span>
                <span className="text-c1-regular text-gray-500">
                  {`${policy.targetRegion || '전국'} · ${formatPeriod(policy.applicationStartDate, policy.applicationEndDate)}`}
                </span>
                <span className="text-c1-regular text-gray-400">{policy.policyCode}</span>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    color="gray"
                    size="small"
                    className="w-auto"
                    onClick={() => setEditing(policy)}
                  >
                    수정
                  </Button>
                  {/*
                    검증 표시는 사용자 화면에서 "확정 금액" 과 "추정 금액" 을 가른다.
                    근거 없이 검증으로 올리면 안 되므로 되돌리기도 함께 둔다.
                  */}
                  {policy.verifiedAt ? (
                    <Button
                      color="gray"
                      size="small"
                      className="w-auto"
                      disabled={isUnverifying}
                      onClick={() => unverifyPolicy(policy.id)}
                    >
                      검증 해제
                    </Button>
                  ) : (
                    <Button
                      color="green"
                      size="small"
                      className="w-auto"
                      disabled={isVerifying}
                      onClick={() => verifyPolicy({ policyId: policy.id })}
                    >
                      검증 표시
                    </Button>
                  )}
                  <Button
                    color="red"
                    size="small"
                    className="w-auto"
                    onClick={() => setDeleteTarget(policy)}
                  >
                    삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {!data?.last && (
            <Button color="gray" size="small" onClick={() => setPage((prev) => prev + 1)}>
              더 보기
            </Button>
          )}
        </>
      )}

      <PolicyFormDialog
        isOpen={isCreating}
        mode="create"
        isPending={isCreatePending}
        isError={isCreateError}
        onClose={() => setIsCreating(false)}
        onSubmit={(values) =>
          createPolicy(toPolicyBody(values), { onSuccess: () => setIsCreating(false) })
        }
      />

      {/* key 로 다시 마운트해 수정 대상이 바뀔 때 이전 입력이 남지 않게 한다 */}
      {editing && (
        <PolicyFormDialog
          key={editing.id}
          isOpen
          mode="edit"
          defaultValues={toFormValues(editing)}
          isPending={isUpdatePending}
          isError={isUpdateError}
          onClose={() => setEditing(null)}
          onSubmit={(values) =>
            updatePolicy(
              { id: editing.id, body: toPolicyPatchBody(values) },
              { onSuccess: () => setEditing(null) },
            )
          }
        />
      )}

      <AlertDialog
        title="정책을 삭제할까요?"
        description="사용자 화면에서도 즉시 사라지며 복구할 수 없어요."
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        cancelButton={
          <Button color="gray" size="small" onClick={() => setDeleteTarget(null)}>
            취소
          </Button>
        }
        confirmButton={
          <Button
            color="red"
            size="small"
            disabled={isDeletePending}
            onClick={() =>
              deleteTarget &&
              deletePolicy(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })
            }
          >
            삭제
          </Button>
        }
      />
    </div>
  )
}

export default AdminPolicyManagePage
