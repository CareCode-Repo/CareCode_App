import { ReactElement } from 'react'
import PostStat from './PostStat'
import CommentIcon from '@/assets/icons/chat.svg'
import LikeIcon from '@/assets/icons/like.svg'

interface PopularPostProps {
  content: string
  likeCount: number // 좋아요수
  commentCount: number // 댓글수
  createdDate: string // 작성날짜
  createdTime: string // 작성시간
  onClick?: () => void // 클릭 이벤트 핸들러
}

const PopularPost = ({
  content,
  likeCount,
  commentCount,
  createdDate,
  createdTime,
  onClick,
}: PopularPostProps): ReactElement => {
  return (
    <div className="flex cursor-pointer py-2 hover:bg-gray-100" onClick={onClick}>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-gray-600">
        <p className="text-b2-regular truncate">{content}</p>
        <span className="text-c1-regular">
          {createdDate} {createdTime}
        </span>
      </div>
      <div className="flex shrink-0 items-end gap-1">
        <PostStat icon={LikeIcon} count={likeCount} className="[&_svg]:fill-red text-red" />
        <PostStat icon={CommentIcon} count={commentCount} className="[&_svg]:fill-blue text-blue" />
      </div>
    </div>
  )
}

export default PopularPost
