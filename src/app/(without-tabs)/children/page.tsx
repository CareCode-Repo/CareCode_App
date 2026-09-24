'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import ChildCard from '@/components/features/child/ChildCard'
import SiblingOverviewCard from '@/components/features/child/SiblingOverviewCard'
import { useMyChildren } from '@/queries/child'

const ChildrenPage = (): ReactElement => {
  const router = useRouter()
  const { data: children, isLoading, isError, refetch } = useMyChildren()

  return (
    <AuthGuard>
      <Layout hasTopNav hasBackButton title="아이 관리" contentClassName="px-4.5 py-5">
        {isLoading ? (
          <ul className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </ul>
        ) : isError ? (
          <ErrorView content="아이 정보를 불러오지 못했어요." onRetry={() => refetch()} />
        ) : !children?.length ? (
          <EmptyState
            title="등록된 아이가 없어요"
            description={
              '아이를 등록하면 생년월일에 맞는\n표준 예방접종 일정을 자동으로 만들어드려요.'
            }
            actionLabel="아이 등록하기"
            onAction={() => router.push('/children/new')}
          />
        ) : (
          <>
            <SiblingOverviewCard onChildClick={(childId) => router.push(`/children/${childId}`)} />
            <Spacer className="h-3 shrink-0" />
            <ul className="flex flex-col gap-3">
              {children.map((child) => (
                <li key={child.id}>
                  <ChildCard child={child} onClick={() => router.push(`/children/${child.id}`)} />
                </li>
              ))}
            </ul>
            <Button
              color="gray"
              size="small"
              className="mt-5"
              onClick={() => router.push('/children/new')}
            >
              아이 추가하기
            </Button>
          </>
        )}
      </Layout>
    </AuthGuard>
  )
}

export default ChildrenPage
