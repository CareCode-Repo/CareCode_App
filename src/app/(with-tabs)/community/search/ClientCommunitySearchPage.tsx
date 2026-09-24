'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { JSX } from 'react'
import { useSearchPosts } from './hooks/useSearchPosts'
import BabyIcon from '@/assets/icons/baby.svg'
import BellIcon from '@/assets/icons/bell.svg'
import SearchIcon from '@/assets/icons/search.svg'
import EmptyState from '@/components/common/EmptyState'
import Input from '@/components/common/input'
import { useInput } from '@/components/common/input/hooks/useInput'
import TopNavBar from '@/components/common/top-navbar'
import IconButton from '@/components/common/top-navbar/IconButton'
import CommunityPost from '@/components/features/community/community-post-list'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { useHasUnreadNotifications } from '@/queries/notification'

export default function ClientCommunitySearchPage(): JSX.Element {
  const params = useSearchParams()
  const router = useRouter()
  const hasUnread = useHasUnreadNotifications()
  const keyword = params.get('keyword') ?? '' // 없으면 빈 문자열
  const searchInput = useInput(keyword)
  const { addSearch } = useRecentSearches()
  const { posts, loadMoreRef, hasNextPage } = useSearchPosts(keyword)

  const handleSearch = () => {
    const trimmed = searchInput.value.trim()
    if (!trimmed) return

    addSearch(trimmed)
    router.push(`/community/search?keyword=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="scrollbar-hide grow overflow-y-scroll">
        <TopNavBar
          title="검색결과"
          actionButtons={[
            {
              icon: BellIcon,
              'aria-label': '알림',
              showBadge: hasUnread,
              onClick: () => router.push('/notification'),
            },
          ]}
          isSticky={true}
          hasBackButton
          onBackButtonClick={() => router.back()}
        />

        <form
          className="flex p-[1.125rem]"
          onSubmit={(event) => {
            event.preventDefault()
            handleSearch()
          }}
        >
          <Input
            value={searchInput.value}
            onChange={searchInput.onChange}
            placeholder="검색어를 입력하세요"
            aria-label="게시글 검색"
            rightIcon={
              <IconButton
                icon={SearchIcon}
                iconClassName="size-6 fill-gray-400"
                aria-label="검색"
                onClick={handleSearch}
              />
            }
          />
        </form>

        {posts.length === 0 ? (
          <EmptyState
            title="검색 결과가 없어요"
            description={`'${keyword}' 와(과) 일치하는 게시글을 찾지 못했어요.`}
          />
        ) : (
          <div className="flex flex-col divide-y divide-gray-200">
            {posts.map((post) => (
              <CommunityPost key={post.postId} post={post} />
            ))}

            <div
              ref={loadMoreRef}
              className="text-c1-regular flex items-center justify-center bg-white py-3 text-gray-500"
              aria-live="polite"
            >
              {hasNextPage ? (
                <>
                  <BabyIcon className="size-8 fill-green-200" aria-hidden />
                  <span className="sr-only">검색 결과를 더 불러오는 중</span>
                </>
              ) : (
                '마지막 게시글입니다.'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
