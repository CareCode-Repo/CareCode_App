import { ReactElement } from 'react'
import { PostListItem as Post } from '@/types/apis/community'
import { formatDate } from '@/utils/date'

interface PostListItemProps {
  post: Post
  onClick?: () => void
}

const PostListItem = ({ post, onClick }: PostListItemProps): ReactElement => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-1.5 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <span className="text-b1-semibold truncate text-gray-800">{post.title}</span>
      <span className="text-b2-regular line-clamp-2 text-gray-600">{post.content}</span>
      <div className="text-c1-regular flex items-center gap-2 text-gray-500">
        <span>{post.isAnonymous ? '익명' : post.authorName}</span>
        <span aria-hidden>·</span>
        <span>{formatDate(post.createdAt, 'MM.dd')}</span>
        <span aria-hidden>·</span>
        <span>{`좋아요 ${post.likeCount}`}</span>
        <span aria-hidden>·</span>
        <span>{`댓글 ${post.commentCount}`}</span>
      </div>
    </button>
  )
}

export default PostListItem
