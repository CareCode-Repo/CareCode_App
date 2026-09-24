'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import SearchIcon from '@/assets/icons/search.svg'
import Chip from '@/components/common/Chip'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import Input from '@/components/common/input'
import IconButton from '@/components/common/top-navbar/IconButton'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { useSearchPolicy } from '@/hooks/useSearchPolicy'
import { useHasUnreadNotifications } from '@/queries/notification'
import { usePolicyCategories, usePopularPolicies } from '@/queries/policy'

const Search = (): ReactElement => {
  const { recentSearches, removeSearch, clearAllSearches } = useRecentSearches()
  const { data: categories = [] } = usePolicyCategories()
  const { data: popular = [] } = usePopularPolicies()
  const router = useRouter()
  const hasUnread = useHasUnreadNotifications()
  const { inputValue, handleInputChange, search } = useSearchPolicy()
  const handleNotificationClick = () => router.push('/notification')
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    search()
  }

  return (
    <Layout
      hasTopNav
      title="육아 정보"
      actionButtons={[
        {
          icon: BellIcon,
          'aria-label': '알림',
          showBadge: hasUnread,
          onClick: handleNotificationClick,
        },
      ]}
      contentClassName="overflow-y-scroll py-6 px-4.5"
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

      {/*
        검색은 "무엇을 찾을지 아는 사람" 만 쓸 수 있다. 카테고리를 앞에 둬서
        무엇이 있는지 모르는 사람도 지원금을 발견할 수 있게 한다.
      */}
      {categories.length > 0 && (
        <section className="flex flex-col gap-3 pb-9">
          <span className="text-b1-semibold text-gray-800">카테고리로 찾기</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((name) => (
              <Chip
                key={name}
                size="md"
                shape="round"
                color="transparent"
                onClick={() => router.push(`/policy/category/${encodeURIComponent(name)}`)}
              >
                {name}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="flex flex-col gap-3 pb-9">
          <span className="text-b1-semibold text-gray-800">많이 찾는 지원금</span>
          <ul className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {popular.slice(0, 5).map((policy) => (
              <li key={policy.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/policy/${policy.id}`)}
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                >
                  <span className="text-b1-medium line-clamp-1 text-gray-800">{policy.title}</span>
                  {policy.category && (
                    <span className="text-c1-regular text-gray-500">{policy.category}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {recentSearches.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-b1-semibold text-gray-800">최근 검색어</span>
            <button
              className="text-b1-regular text-gray-700 hover:text-gray-800"
              onClick={clearAllSearches}
            >
              전체삭제
            </button>
          </div>
          <div className="scrollbar-hide flex gap-2.5 overflow-x-scroll [&>*]:shrink-0">
            {recentSearches.map((recentSearchValue) => (
              <Chip
                key={recentSearchValue}
                size="md"
                color="transparent"
                shape="round"
                deletable
                onDelete={() => removeSearch(recentSearchValue)}
                onClick={() => search(recentSearchValue)}
              >
                {recentSearchValue}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Search
