import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
  useQueryClient,
  useSuspenseInfiniteQuery,
  UseSuspenseInfiniteQueryResult,
  useSuspenseQuery,
  UseSuspenseQueryResult,
} from '@tanstack/react-query'
import { getAccessToken } from '@/apis/auth'
import {
  deleteCommunityComment,
  deleteCommunityPost,
  getBookmarkedPosts,
  getCommunityPostById,
  getCommunityPosts,
  getCommunityPopular,
  getCommunitySearch,
  getCommunityTags,
  getLikedPosts,
  postCommunityComment,
  postCommunityPost,
  putCommunityComment,
  putCommunityPost,
  toggleCommunityBookmark,
  toggleCommunityLike,
} from '@/apis/community'
import {
  CommunityTag,
  PostListItem,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  DeleteCommunityPostPath,
  GetCommunityPostByIdPath,
  GetCommunityPostByIdResponse,
  GetCommunityPostsQuery,
  GetCommunityPostsResponse,
  GetCommunitySearchQuery,
  GetCommunitySearchResponse,
  PostCommunityCommentBody,
  PostCommunityCommentPath,
  PostCommunityCommentResponse,
  PutCommunityCommentBody,
  PutCommunityCommentResponse,
  PostCommunityPostBody,
  PostCommunityPostResponse,
  PutCommunityPostBody,
  PutCommunityPostPath,
  PutCommunityPostResponse,
} from '@/types/apis/community'

export const communityQueries = createQueryKeys('community', {
  /**
   * 목록 키는 요청 조건을 그대로 품는다.
   * 조건이 키에 없으면 카테고리·정렬을 바꿔도 같은 캐시를 돌려주고 재요청도 나가지 않는다.
   * 조건 없이 `['community', 'list']` 로 무효화하면 모든 조건의 목록이 함께 무효화된다.
   */
  list: (query: GetCommunityPostsQuery = {}) => ({
    queryKey: [{ ...query, page: undefined }],
  }),

  popular: () => ({
    queryKey: ['popular'],
  }),

  detail: (postId: GetCommunityPostByIdPath['postId']) => ({
    queryKey: ['detail', { postId }],
  }),

  search: (keyword: GetCommunitySearchQuery['keyword'], size: GetCommunitySearchQuery['size']) => ({
    queryKey: [{ keyword, size }],
  }),

  liked: () => ({
    queryKey: ['liked'],
    queryFn: getLikedPosts,
  }),

  bookmarked: () => ({
    queryKey: ['bookmarked'],
    queryFn: getBookmarkedPosts,
  }),

  tags: () => ({
    queryKey: ['tags'],
    queryFn: getCommunityTags,
  }),
})

export const useGetCommunityPosts = (
  query: GetCommunityPostsQuery,
): UseInfiniteQueryResult<InfiniteData<GetCommunityPostsResponse>, Error> => {
  return useInfiniteQuery({
    queryKey: communityQueries.list(query).queryKey,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) =>
      await getCommunityPosts({ ...query, page: pageParam }),
    // page 는 0-base, totalPages 는 개수다. `page < totalPages` 로 판단하면 마지막 페이지에서도
    // 참이라 빈 페이지를 한 번 더 부른다. 서버가 주는 hasNext 를 그대로 쓴다.
    getNextPageParam: (lastPage: GetCommunityPostsResponse) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    retry: false,
  })
}

export const usePostCommunityPost = (): UseMutationResult<
  PostCommunityPostResponse,
  Error,
  PostCommunityPostBody
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PostCommunityPostBody) => postCommunityPost(body), // 여기 mutationFn 타입 맞춤
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityQueries.list._def })
    },
  })
}

export const useGetCommunityPostDetail = ({
  postId,
}: GetCommunityPostByIdPath): UseSuspenseQueryResult<GetCommunityPostByIdResponse, Error> => {
  return useSuspenseQuery({
    queryKey: communityQueries.detail(postId).queryKey,
    queryFn: () => getCommunityPostById({ postId }),
  })
}

export const usePostCommunityPostComment = ({
  postId,
}: PostCommunityCommentPath): UseMutationResult<
  PostCommunityCommentResponse,
  Error,
  PostCommunityCommentBody
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PostCommunityCommentBody) => postCommunityComment({ postId }, body),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: communityQueries.detail(postId).queryKey })
    },
  })
}

export const usePutCommunityPost = ({
  postId,
}: PutCommunityPostPath): UseMutationResult<
  PutCommunityPostResponse,
  Error,
  PutCommunityPostBody
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PutCommunityPostBody) => putCommunityPost({ postId }, body),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: communityQueries.detail(postId).queryKey })
      queryClient.invalidateQueries({ queryKey: communityQueries.list._def })
    },
  })
}

export const useDeleteCommunityPost = ({
  postId,
}: DeleteCommunityPostPath): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteCommunityPost({ postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityQueries.list._def })
      // 상세는 useSuspenseQuery 라 캐시를 지우면 그 자리에서 다시 조회(=404)를 시도한다.
      // 삭제 화면은 곧바로 목록으로 빠져나가므로, 다시 그릴 일이 없도록 무효화만 걸어
      // 다음에 같은 글을 열었을 때 새로 받게 한다. (setTimeout 으로 지우던 것을 대체)
      queryClient.invalidateQueries({
        queryKey: communityQueries.detail(postId).queryKey,
        refetchType: 'none',
      })
    },
  })
}

export const useGetCommunitySearch = ({
  keyword,
  size = 10,
}: {
  keyword: GetCommunitySearchQuery['keyword']
  size: GetCommunitySearchQuery['size']
}): UseSuspenseInfiniteQueryResult<InfiniteData<GetCommunitySearchResponse>, Error> => {
  return useSuspenseInfiniteQuery({
    queryKey: communityQueries.search(keyword, size).queryKey,
    queryFn: ({ pageParam = 0 }) => getCommunitySearch({ keyword, page: pageParam, size }),
    getNextPageParam: (lastPage: GetCommunitySearchResponse) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    retry: false,
  })
}

export const useGetCommunityPopular = (): UseQueryResult<GetCommunityPostsResponse, Error> => {
  return useQuery({
    queryKey: communityQueries.popular().queryKey,
    queryFn: () => getCommunityPopular({ page: 0, size: 5 }),
    retry: false,
  })
}

export const useLikedPosts = (): UseQueryResult<PostListItem[], Error> =>
  useQuery({ ...communityQueries.liked(), enabled: !!getAccessToken() })

export const useBookmarkedPosts = (): UseQueryResult<PostListItem[], Error> =>
  useQuery({ ...communityQueries.bookmarked(), enabled: !!getAccessToken() })

export const useCommunityTags = (): UseQueryResult<CommunityTag[], Error> =>
  useQuery({ ...communityQueries.tags(), staleTime: 1000 * 60 * 30 })

/**
 * 좋아요 토글.
 * 응답 자체가 최신 상태(isLiked/likeCount)를 주므로 상세 캐시를 즉시 갱신하고,
 * 목록·좋아요함은 무효화해 다음 조회에서 맞춰지게 한다.
 */
export const useToggleCommunityLike = (
  postId: number,
): UseMutationResult<ToggleLikeResponse, Error, void> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleCommunityLike(postId),
    onSuccess: (result) => {
      queryClient.setQueryData(
        communityQueries.detail(postId).queryKey,
        (prev: GetCommunityPostByIdResponse | undefined) =>
          prev ? { ...prev, isLiked: result.isLiked, likeCount: result.likeCount } : prev,
      )
      queryClient.invalidateQueries({ queryKey: communityQueries.liked().queryKey })
      queryClient.invalidateQueries({ queryKey: communityQueries.list._def })
    },
  })
}

export const useToggleCommunityBookmark = (
  postId: number,
): UseMutationResult<ToggleBookmarkResponse, Error, void> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleCommunityBookmark(postId),
    onSuccess: (result) => {
      queryClient.setQueryData(
        communityQueries.detail(postId).queryKey,
        (prev: GetCommunityPostByIdResponse | undefined) =>
          prev ? { ...prev, isBookmarked: result.isBookmarked } : prev,
      )
      queryClient.invalidateQueries({ queryKey: communityQueries.bookmarked().queryKey })
    },
  })
}

/**
 * 댓글 수정·삭제.
 * 상세 캐시를 다시 받아야 화면의 댓글 목록과 개수가 함께 맞는다.
 */
export const useUpdateCommunityComment = (
  postId: number,
): UseMutationResult<
  PutCommunityCommentResponse,
  Error,
  { commentId: number } & PutCommunityCommentBody
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }) => putCommunityComment({ commentId }, { content }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: communityQueries.detail(postId).queryKey })
    },
  })
}

export const useDeleteCommunityComment = (
  postId: number,
): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => deleteCommunityComment({ commentId }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: communityQueries.detail(postId).queryKey })
      // 목록의 댓글 수도 달라진다.
      queryClient.invalidateQueries({ queryKey: communityQueries.list._def })
    },
  })
}
