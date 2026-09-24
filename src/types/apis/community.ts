import { z } from 'zod'

export const postAuthorSchema = z.object({
  userId: z.string(),
  name: z.string(),
  profileImageUrl: z.string().url().optional(),
})
export type PostAuthor = z.infer<typeof postAuthorSchema>

/**
 * 서버 CommunityCommentResponse. replies 는 같은 모양의 댓글 객체 트리다.
 *
 * 예전 스키마는 replies 를 문자열 배열로 받아, 답글이 하나라도 달린 글은 상세 파싱 전체가 실패해
 * 글이 열리지 않았다. 탈퇴한 작성자의 댓글은 authorId 가 없을 수 있다.
 */
export type PostComment = {
  commentId: number
  content: string
  authorName: string
  authorId?: string | null
  createdAt: string
  likeCount?: number | null
  isLiked?: boolean | null
  parentCommentId?: number | null
  replies: PostComment[]
}
export const postCommentSchema: z.ZodType<PostComment, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    commentId: z.number(),
    content: z.string(),
    authorName: z.string(),
    authorId: z.string().nullish(),
    createdAt: z.string(),
    likeCount: z.number().nullish(),
    isLiked: z.boolean().nullish(),
    parentCommentId: z.number().nullish(),
    replies: z
      .array(postCommentSchema)
      .nullish()
      .transform((v) => v ?? []),
  }),
)

export const postSchema = z.object({
  postId: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  authorName: z.string(),
  authorId: z.string(),
  isAnonymous: z.boolean(),

  createdAt: z.string(),
  viewCount: z.number(),
  likeCount: z.number(),
  commentCount: z.number(),
  tags: z.array(z.string()).nullable().default([]),
  isLiked: z.boolean().optional(),
  isBookmarked: z.boolean().optional(),

  comments: z.array(postCommentSchema).optional(),
  relatedPosts: z.array(z.string()).nullable().default([]),
})
export type Post = z.infer<typeof postSchema>

export const postListItemSchema = z.object({
  postId: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  authorName: z.string(),
  authorId: z.string(),
  isAnonymous: z.boolean(),
  createdAt: z.string(),
  viewCount: z.number(),
  likeCount: z.number(),
  commentCount: z.number(),
  tags: z.array(z.string()),
  isLiked: z.boolean().optional(),
  isBookmarked: z.boolean().optional(),
})
export type PostListItem = z.infer<typeof postListItemSchema>

// PUT /community/comments/{commentId} - 서버 CommunityUpdateCommentRequest 대응
export const putCommunityCommentPathSchema = z.object({ commentId: z.number() })
export type PutCommunityCommentPath = z.infer<typeof putCommunityCommentPathSchema>
export const putCommunityCommentBodySchema = z.object({
  content: z.string().min(1, '내용을 입력해주세요'),
})
export type PutCommunityCommentBody = z.infer<typeof putCommunityCommentBodySchema>
export const putCommunityCommentResponseSchema = postCommentSchema
export type PutCommunityCommentResponse = z.infer<typeof putCommunityCommentResponseSchema>

// DELETE /community/comments/{commentId}
export const deleteCommunityCommentPathSchema = z.object({ commentId: z.number() })
export type DeleteCommunityCommentPath = z.infer<typeof deleteCommunityCommentPathSchema>

/**
 * GET /community/tags — 서버 CommunityTagResponse 대응.
 *
 * `z.array(z.string())` 로 파싱하고 있어서 이 API 는 부를 때마다 실패했다.
 * 서버는 이름뿐 아니라 id·설명까지 담은 객체를 준다.
 */
export const communityTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullish(),
  createdAt: z.string().nullish(),
})
export type CommunityTag = z.infer<typeof communityTagSchema>
export const communityTagListSchema = z.array(communityTagSchema)

// /community/posts 게시글 리스트 조회
export const getCommunityPostsQuerySchema = z.object({
  page: z.number().optional(),
  size: z.number().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
})
export type GetCommunityPostsQuery = z.infer<typeof getCommunityPostsQuerySchema>
export const getCommunityPostsResponseSchema = z.object({
  content: z.array(postListItemSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  first: z.boolean(),
  last: z.boolean(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
})
export type GetCommunityPostsResponse = z.infer<typeof getCommunityPostsResponseSchema>

// /community/posts 게시글 등록
export const postCommunityPostBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().default('PARENTING'),
  tags: z.array(z.string()).optional(),
  isAnonymous: z.boolean().default(false),
})
export type PostCommunityPostBody = z.infer<typeof postCommunityPostBodySchema>
export const postCommunityPostResponseSchema = postSchema
export type PostCommunityPostResponse = z.infer<typeof postCommunityPostResponseSchema>

// /community/posts/{postId} 게시글 상세 조회
export const getCommunityPostByIdPathSchema = z.object({
  postId: z.number(),
})
export type GetCommunityPostByIdPath = z.infer<typeof getCommunityPostByIdPathSchema>
export const getCommunityPostByIdResponseSchema = postSchema
export type GetCommunityPostByIdResponse = z.infer<typeof getCommunityPostByIdResponseSchema>

// /community/posts/{postId}/comments 댓글달기
export const postCommunityCommentPathSchema = z.object({
  postId: z.number(),
})
export type PostCommunityCommentPath = z.infer<typeof postCommunityCommentPathSchema>
export const postCommunityCommentBodySchema = z.object({
  content: z.string(),
  parentCommentId: z.number().optional(),
})
export type PostCommunityCommentBody = z.infer<typeof postCommunityCommentBodySchema>
export const postCommunityCommentResponseSchema = z.object({
  commentId: z.number(),
  content: z.string(),
  authorName: z.string(),
  authorId: z.string(),
  createdAt: z.string(),
  likeCount: z.number(),
  isLiked: z.boolean(),
  parentCommentId: z.number().nullable(),
  replies: z.array(z.string()).default([]),
})
export type PostCommunityCommentResponse = z.infer<typeof postCommunityCommentResponseSchema>

export const putCommunityPostPathSchema = z.object({
  postId: z.number(),
})
export type PutCommunityPostPath = z.infer<typeof putCommunityPostPathSchema>
export const putCommunityPostBodySchema = postSchema
export type PutCommunityPostBody = z.infer<typeof putCommunityPostBodySchema>
export const putCommunityPostResponseSchema = postSchema
export type PutCommunityPostResponse = z.infer<typeof putCommunityPostResponseSchema>

export const deleteCommunityPostPathSchema = z.object({
  postId: z.number(),
})
export type DeleteCommunityPostPath = z.infer<typeof deleteCommunityPostPathSchema>

export const getCommunitySearchQuerySchema = z.object({
  keyword: z.string(),
  page: z.number().default(0),
  size: z.number().default(10),
})
export type GetCommunitySearchQuery = z.infer<typeof getCommunitySearchQuerySchema>
export const getCommunitySearchResponseSchema = z.object({
  content: z.array(postListItemSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  first: z.boolean(),
  last: z.boolean(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
})
export type GetCommunitySearchResponse = z.infer<typeof getCommunitySearchResponseSchema>

// /community/posts/{postId}/like - 토글 응답
export const toggleLikeResponseSchema = z.object({
  isLiked: z.boolean(),
  likeCount: z.number(),
})
export type ToggleLikeResponse = z.infer<typeof toggleLikeResponseSchema>

// /community/posts/{postId}/bookmark - 토글 응답
export const toggleBookmarkResponseSchema = z.object({
  isBookmarked: z.boolean(),
  bookmarkCount: z.number(),
})
export type ToggleBookmarkResponse = z.infer<typeof toggleBookmarkResponseSchema>
