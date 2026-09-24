import { CareCode } from './interceptor'
import {
  CommunityTag,
  communityTagListSchema,
  PostListItem,
  postListItemSchema,
  ToggleBookmarkResponse,
  toggleBookmarkResponseSchema,
  ToggleLikeResponse,
  toggleLikeResponseSchema,
  DeleteCommunityPostPath,
  deleteCommunityPostPathSchema,
  GetCommunityPostByIdPath,
  getCommunityPostByIdPathSchema,
  GetCommunityPostByIdResponse,
  getCommunityPostByIdResponseSchema,
  GetCommunityPostsQuery,
  getCommunityPostsQuerySchema,
  GetCommunityPostsResponse,
  getCommunityPostsResponseSchema,
  GetCommunitySearchQuery,
  getCommunitySearchQuerySchema,
  GetCommunitySearchResponse,
  getCommunitySearchResponseSchema,
  PostCommunityCommentBody,
  postCommunityCommentBodySchema,
  PostCommunityCommentPath,
  postCommunityCommentPathSchema,
  PostCommunityCommentResponse,
  postCommunityCommentResponseSchema,
  PutCommunityCommentBody,
  putCommunityCommentBodySchema,
  PutCommunityCommentPath,
  putCommunityCommentPathSchema,
  PutCommunityCommentResponse,
  putCommunityCommentResponseSchema,
  DeleteCommunityCommentPath,
  deleteCommunityCommentPathSchema,
  PostCommunityPostBody,
  postCommunityPostBodySchema,
  PostCommunityPostResponse,
  postCommunityPostResponseSchema,
  PutCommunityPostBody,
  putCommunityPostBodySchema,
  PutCommunityPostPath,
  putCommunityPostPathSchema,
  PutCommunityPostResponse,
  putCommunityPostResponseSchema,
} from '@/types/apis/community'

export const getCommunityPosts = async (
  query: GetCommunityPostsQuery,
): Promise<GetCommunityPostsResponse> => {
  const parsedQuery = getCommunityPostsQuerySchema.parse(query)

  const res = await CareCode.get('/community/posts', {
    params: parsedQuery,
  })
  return getCommunityPostsResponseSchema.parse(res.data)
}

export const postCommunityPost = async (
  body: PostCommunityPostBody,
): Promise<PostCommunityPostResponse> => {
  const parsedBody = postCommunityPostBodySchema.parse(body)
  const res = await CareCode.post('/community/posts', parsedBody)
  return postCommunityPostResponseSchema.parse(res.data)
}

export const getCommunityPostById = async (
  path: GetCommunityPostByIdPath,
): Promise<GetCommunityPostByIdResponse> => {
  const parsedPath = getCommunityPostByIdPathSchema.parse(path)
  const res = await CareCode.get(`/community/posts/${parsedPath.postId}`)
  return getCommunityPostByIdResponseSchema.parse(res.data)
}

export const postCommunityComment = async (
  path: PostCommunityCommentPath,
  body: PostCommunityCommentBody,
): Promise<PostCommunityCommentResponse> => {
  const parsedPath = postCommunityCommentPathSchema.parse(path)
  const parsedBody = postCommunityCommentBodySchema.parse(body)
  const res = await CareCode.post(`/community/posts/${parsedPath.postId}/comments`, parsedBody)
  return postCommunityCommentResponseSchema.parse(res.data)
}

export const putCommunityPost = async (
  path: PutCommunityPostPath,
  body: PutCommunityPostBody,
): Promise<PutCommunityPostResponse> => {
  const parsedPath = putCommunityPostPathSchema.parse(path)
  const parsedBody = putCommunityPostBodySchema.parse(body)
  const res = await CareCode.put(`/community/posts/${parsedPath.postId}`, parsedBody)
  return putCommunityPostResponseSchema.parse(res.data)
}

export const deleteCommunityPost = async (path: DeleteCommunityPostPath): Promise<void> => {
  const parsedPath = deleteCommunityPostPathSchema.parse(path)
  await CareCode.delete(`/community/posts/${parsedPath.postId}`)
}

export const getCommunityPopular = async (
  query: GetCommunityPostsQuery,
): Promise<GetCommunityPostsResponse> => {
  const parsedQuery = getCommunityPostsQuerySchema.parse(query)

  const res = await CareCode.get('/community/popular', {
    params: parsedQuery,
  })
  return getCommunityPostsResponseSchema.parse(res.data)
}

export const getCommunitySearch = async (
  query: GetCommunitySearchQuery,
): Promise<GetCommunitySearchResponse> => {
  const parsedQuery = getCommunitySearchQuerySchema.parse(query)

  const res = await CareCode.get('/community/search', {
    params: parsedQuery,
  })
  return getCommunitySearchResponseSchema.parse(res.data)
}

// ==================== 좋아요 / 북마크 ====================

// POST /community/posts/{postId}/like - 토글 방식
export const toggleCommunityLike = async (postId: number): Promise<ToggleLikeResponse> => {
  const res = await CareCode.post(`/community/posts/${postId}/like`)
  return toggleLikeResponseSchema.parse(res.data)
}

// POST /community/posts/{postId}/bookmark - 토글 방식
export const toggleCommunityBookmark = async (postId: number): Promise<ToggleBookmarkResponse> => {
  const res = await CareCode.post(`/community/posts/${postId}/bookmark`)
  return toggleBookmarkResponseSchema.parse(res.data)
}

// GET /community/posts/liked
export const getLikedPosts = async (): Promise<PostListItem[]> => {
  const res = await CareCode.get('/community/posts/liked')
  return postListItemSchema.array().parse(res.data)
}

// GET /community/posts/bookmarked
export const getBookmarkedPosts = async (): Promise<PostListItem[]> => {
  const res = await CareCode.get('/community/posts/bookmarked')
  return postListItemSchema.array().parse(res.data)
}

// GET /community/tags - 인기 태그
export const getCommunityTags = async (): Promise<CommunityTag[]> => {
  const res = await CareCode.get('/community/tags')
  return communityTagListSchema.parse(res.data)
}

// PUT /community/comments/{commentId}
export const putCommunityComment = async (
  path: PutCommunityCommentPath,
  body: PutCommunityCommentBody,
): Promise<PutCommunityCommentResponse> => {
  const parsedPath = putCommunityCommentPathSchema.parse(path)
  const parsedBody = putCommunityCommentBodySchema.parse(body)
  const res = await CareCode.put(`/community/comments/${parsedPath.commentId}`, parsedBody)
  return putCommunityCommentResponseSchema.parse(res.data)
}

// DELETE /community/comments/{commentId}
export const deleteCommunityComment = async (path: DeleteCommunityCommentPath): Promise<void> => {
  const parsedPath = deleteCommunityCommentPathSchema.parse(path)
  await CareCode.delete(`/community/comments/${parsedPath.commentId}`)
}
