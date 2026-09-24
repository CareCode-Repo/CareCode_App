'use client'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import PolicyCard from '@/components/features/policy/PolicyCard'
import { usePoliciesByCategory, usePolicyCategories } from '@/queries/policy'
import { convertPolicyToCardProps } from '@/types/policy'

const CategoryPolicyPage = (): ReactElement => {
  const params = useParams<{ category: string }>()
  const router = useRouter()
  const category = decodeURIComponent(params?.category ?? '')

  const { data: policies = [], isLoading, isError, refetch } = usePoliciesByCategory(category)
  const { data: categories = [] } = usePolicyCategories()

  return (
    <Layout hasTopNav hasBackButton title={category} contentClassName="px-4.5 py-5">
      {/* 다른 카테고리로 바로 건너뛸 수 있어야 한다. 뒤로 갔다 다시 들어오게 하면 번거롭다. */}
      {categories.length > 0 && (
        <div className="scrollbar-hide -mx-4.5 mb-4 flex gap-2 overflow-x-auto px-4.5 [&>*]:shrink-0">
          {categories.map((name) => (
            <Chip
              key={name}
              size="md"
              shape="round"
              color={name === category ? 'green' : 'transparent'}
              onClick={() => router.replace(`/policy/category/${encodeURIComponent(name)}`)}
            >
              {name}
            </Chip>
          ))}
        </div>
      )}

      {isLoading ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </ul>
      ) : isError ? (
        <ErrorView content="정책을 불러오지 못했어요." onRetry={() => refetch()} />
      ) : policies.length === 0 ? (
        <EmptyState
          title={`'${category}' 지원금이 아직 없어요`}
          description={'다른 카테고리를 눌러보거나\n검색으로 찾아보세요.'}
          actionLabel="검색으로 찾기"
          onAction={() => router.push('/search')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-b2-regular text-gray-600">{`${policies.length}건`}</span>
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              {...convertPolicyToCardProps(policy)}
              onClick={() => router.push(`/policy/${policy.id}`)}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

export default CategoryPolicyPage
