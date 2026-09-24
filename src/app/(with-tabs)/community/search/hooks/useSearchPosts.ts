import { UseSuspenseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query'
import { RefObject, useMemo } from 'react'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { useGetCommunitySearch } from '@/queries/community'
import {
  GetCommunitySearchQuery,
  GetCommunitySearchResponse,
  PostListItem,
} from '@/types/apis/community'

export type UseSearchPostsReturn = {
  posts: PostListItem[]
  /** 이 요소가 화면에 들어오면 다음 페이지를 불러온다. */
  loadMoreRef: RefObject<HTMLDivElement | null>
} & Omit<UseSuspenseInfiniteQueryResult<InfiniteData<GetCommunitySearchResponse>, Error>, 'data'>

export function useSearchPosts(keyword: GetCommunitySearchQuery['keyword']): UseSearchPostsReturn {
  const query = useGetCommunitySearch({ keyword, size: 10 })
  // 화면마다 IntersectionObserver 를 다시 짜지 않는다. 옵션 객체를 모듈 스코프에 둬야
  // 매 렌더마다 옵저버가 다시 만들어지지 않는데, 그 처리는 이 훅 안에 있다.
  const { loadMoreRef } = useInfiniteScroll(query)

  const { data, ...rest } = query
  const posts = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data])

  return { posts, loadMoreRef, ...rest }
}
