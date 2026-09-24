'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, use } from 'react'
import SearchIcon from '@/assets/icons/search.svg'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import Input from '@/components/common/input'
import IconButton from '@/components/common/top-navbar/IconButton'
import PolicyCard from '@/components/features/policy/PolicyCard'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { useSearchPolicy } from '@/hooks/useSearchPolicy'
import { useSearchPolicies } from '@/queries/policy'
import { convertPolicyToCardProps } from '@/types/policy'

interface PolicySearchPageProps {
  searchParams: Promise<{
    keyword?: string
  }>
}

const PolicySearchPage = ({ searchParams }: PolicySearchPageProps): ReactElement => {
  const router = useRouter()
  const { keyword } = use(searchParams)
  const { inputValue, handleInputChange, search } = useSearchPolicy(keyword || '')

  const searchQuery = useSearchPolicies({
    keyword: keyword || '',
  })

  const { loadMoreRef, data, isLoading, isError, error } = useInfiniteScroll(searchQuery)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    search()
  }

  const allPolicies = data?.pages.flatMap((page) => page.policies) || []
  const totalCount = data?.pages[0]?.totalElements || 0
  return (
    <Layout
      hasTopNav
      hasBackButton
      title="검색 결과"
      contentClassName="overflow-y-scroll pt-6 px-4.5 bg-white"
    >
      <form onSubmit={handleSubmit}>
        <Input
          value={inputValue}
          placeholder="검색어를 입력하세요"
          onChange={handleInputChange}
          rightIcon={
            <IconButton
              icon={SearchIcon}
              iconClassName="size-6 fill-gray-400"
              aria-label="검색"
              onClick={() => search()}
            />
          }
        />
      </form>
      <Spacer className="h-9 shrink-0" />
      <div className="flex flex-col gap-3">
        <span className="text-b1-semibold text-gray-800">
          {keyword ? `정책 정보 ${totalCount}건` : '검색어를 입력하세요'}
        </span>
        {/* <div className="flex gap-2">
          <ToggleChip>최신일순</ToggleChip>
          <ToggleChip>마감일순</ToggleChip>
        </div> */}
      </div>
      <Spacer className="h-3 shrink-0" />
      <div className="scrollbar-hide flex h-full grow flex-col gap-2 overflow-y-scroll [&>*]:shrink-0">
        {isError && (
          <div className="flex items-center justify-center p-4 text-red-500">
            검색 중 오류가 발생했습니다: {error?.message}
          </div>
        )}

        {keyword && !isLoading && allPolicies.length === 0 && (
          <div className="flex items-center justify-center p-4 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

        {allPolicies.map((policy) => {
          const cardProps = convertPolicyToCardProps(policy)
          return (
            <PolicyCard
              key={policy.id}
              {...cardProps}
              onClick={() => router.push(`/policy/${policy.id}`)}
            />
          )
        })}

        {isLoading && (
          <div className="flex items-center justify-center p-4 text-gray-500">로딩 중...</div>
        )}

        <div ref={loadMoreRef} />
      </div>
    </Layout>
  )
}

export default PolicySearchPage
