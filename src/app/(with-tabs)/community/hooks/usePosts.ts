import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query'
import { RefObject, useMemo } from 'react'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { useGetCommunityPosts } from '@/queries/community'
import { GetCommunityPostsQuery, GetCommunityPostsResponse } from '@/types/apis/community'

export type UsePostsReturn = {
  posts: GetCommunityPostsResponse['content']
  /** 이 요소가 화면에 들어오면 다음 페이지를 불러온다. */
  loadMoreRef: RefObject<HTMLDivElement | null>
} & Omit<UseInfiniteQueryResult<InfiniteData<GetCommunityPostsResponse>, Error>, 'data'>

export function usePosts(query: GetCommunityPostsQuery): UsePostsReturn {
  const queryResult = useGetCommunityPosts(query)
  const { loadMoreRef } = useInfiniteScroll(queryResult)

  const { data, ...rest } = queryResult
  const posts = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data])

  return { posts, loadMoreRef, ...rest }
}
