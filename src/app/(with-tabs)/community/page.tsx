'use client'

import { useRouter } from 'next/navigation'
import { JSX, useState } from 'react'
import { usePosts } from './hooks/usePosts'
import BabyIcon from '@/assets/icons/baby.svg'
import BellIcon from '@/assets/icons/bell.svg'
import SearchIcon from '@/assets/icons/search.svg'
import Chip from '@/components/common/Chip'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Input from '@/components/common/input'
import { useInput } from '@/components/common/input/hooks/useInput'
import TopNavBar from '@/components/common/top-navbar'
import IconButton from '@/components/common/top-navbar/IconButton'
import NewPostFAB from '@/components/features/community/NewPostFAB'
import CommunityPost from '@/components/features/community/community-post-list'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { useCommunityTags } from '@/queries/community'
import { useHasUnreadNotifications } from '@/queries/notification'

const Community = (): JSX.Element => {
  const router = useRouter()
  const hasUnread = useHasUnreadNotifications()
  const searchInput = useInput('')
  const [isSearching, setIsSearching] = useState(false)

  // 최근 검색어는 /search 화면과 같은 저장소를 쓴다. 화면마다 따로 들고 있으면 서로 어긋난다.
  const { recentSearches, addSearch, removeSearch, clearAllSearches } = useRecentSearches()

  const { posts, loadMoreRef, hasNextPage, isLoading, isError, refetch } = usePosts({ size: 10 })
  const { data: tags = [] } = useCommunityTags()

  const goToSearch = (keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) return

    addSearch(trimmed)
    router.push(`/community/search?keyword=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="scrollbar-hide grow overflow-y-scroll">
        {/* 검색 중에는 목록 대신 최근 검색어를 보여주므로 상단바를 접는다. */}
        {!isSearching && (
          <TopNavBar
            title="커뮤니티"
            actionButtons={[
              {
                icon: BellIcon,
                'aria-label': '알림',
                showBadge: hasUnread,
                onClick: () => router.push('/notification'),
              },
            ]}
            isSticky
          />
        )}

        <form
          className="flex items-center gap-2 p-[1.125rem]"
          onSubmit={(event) => {
            event.preventDefault()
            goToSearch(searchInput.value)
          }}
        >
          <Input
            value={searchInput.value}
            onChange={searchInput.onChange}
            onFocus={() => setIsSearching(true)}
            placeholder="검색어를 입력하세요"
            aria-label="게시글 검색"
            rightIcon={
              <IconButton
                icon={SearchIcon}
                iconClassName="size-6 fill-gray-400"
                aria-label="검색"
                onClick={() => goToSearch(searchInput.value)}
              />
            }
          />
          {/* 검색 패널로 들어오면 목록이 가려진다. 되돌아갈 길을 남긴다. */}
          {isSearching && (
            <button
              type="button"
              onClick={() => setIsSearching(false)}
              className="text-b1-regular shrink-0 rounded px-1 text-gray-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
            >
              취소
            </button>
          )}
        </form>

        {/*
          태그로 게시글을 거르는 API 가 없어 태그 이름으로 검색을 태운다.
          없는 필터를 흉내 내는 것보다 실제로 동작하는 경로를 쓴다.
        */}
        {!isSearching && tags.length > 0 && (
          <div className="scrollbar-hide flex gap-2 overflow-x-auto px-[1.125rem] pb-3 [&>*]:shrink-0">
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                size="md"
                shape="round"
                color="transparent"
                onClick={() => goToSearch(tag.name)}
              >
                {tag.name}
              </Chip>
            ))}
          </div>
        )}

        {isSearching ? (
          <div className="flex w-full flex-col items-start gap-6 p-[1.125rem]">
            <div className="flex w-full items-center justify-between">
              <span className="text-b1-semibold text-gray-800">최근 검색어</span>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllSearches}
                  className="text-b1-regular text-gray-700 hover:text-gray-800"
                >
                  전체삭제
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <p className="text-b2-regular text-gray-600">최근 검색어가 없어요.</p>
            ) : (
              <div className="scrollbar-hide flex gap-2.5 overflow-x-scroll [&>*]:shrink-0">
                {recentSearches.map((keyword) => (
                  <Chip
                    key={keyword}
                    size="md"
                    shape="round"
                    color="transparent"
                    deletable
                    onClick={() => goToSearch(keyword)}
                    onDelete={() => removeSearch(keyword)}
                  >
                    {keyword}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        ) : isError ? (
          <ErrorView content="게시글을 불러오지 못했어요." onRetry={() => refetch()} />
        ) : isLoading ? (
          <ul className="flex flex-col gap-3 px-[1.125rem]">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </ul>
        ) : posts.length === 0 ? (
          <EmptyState
            title="아직 게시글이 없어요"
            description="첫 글을 남겨보세요."
            actionLabel="글 쓰기"
            onAction={() => router.push('/community/write')}
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
                  <span className="sr-only">게시글을 더 불러오는 중</span>
                </>
              ) : (
                '마지막 게시글입니다.'
              )}
            </div>
          </div>
        )}
      </div>

      {/* 목록을 보고 있을 때만 띄운다. 검색 패널 위에 글쓰기 버튼이 뜰 이유가 없다. */}
      {!isSearching && <NewPostFAB />}
    </div>
  )
}

export default Community
