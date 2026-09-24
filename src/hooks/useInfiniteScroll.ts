import { UseInfiniteQueryResult } from '@tanstack/react-query'
import { RefObject, useEffect, useRef } from 'react'

import useIntersectionObserver from '@/hooks/useIntersectionObserver'

/**
 * 목록 끝에서 200px 앞서 다음 페이지를 부른다. 바닥에 닿고 나서 부르면 빈 화면이 보인다.
 * 객체 참조가 매 렌더 바뀌면 옵저버가 다시 만들어지므로 모듈 스코프에 둔다.
 */
const ioOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '200px',
  threshold: 0,
}

/**
 * 이 훅이 실제로 쓰는 것만 요구한다.
 * `UseInfiniteQueryResult` 로 못박으면 `useSuspenseInfiniteQuery` 결과를 받지 못한다
 * (suspense 결과에는 isPlaceholderData 등이 없어 union 이 서로 대입되지 않는다).
 */
type InfiniteQueryLike = Pick<
  UseInfiniteQueryResult,
  'fetchNextPage' | 'hasNextPage' | 'isFetchingNextPage'
>

type UseInfiniteScrollReturn<TQuery> = TQuery & {
  loadMoreRef: RefObject<HTMLDivElement | null>
  isIntersecting: boolean | undefined
  observerRef: RefObject<IntersectionObserver | null>
}

const useInfiniteScroll = <TQuery extends InfiniteQueryLike>(
  query: TQuery,
): UseInfiniteScrollReturn<TQuery> => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const {
    entries: [entry],
    observerRef,
  } = useIntersectionObserver(loadMoreRef, ioOptions)

  const isIntersecting = entry?.isIntersecting

  useEffect(() => {
    // 이미 받아오는 중이면 다시 부르지 않는다.
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    loadMoreRef,
    isIntersecting,
    observerRef,
    ...query,
  }
}

export default useInfiniteScroll
