'use client'
import clsx from 'clsx'
import { ReactElement, useState } from 'react'
import ArrowDownRightIcon from '@/assets/icons/arrow_down_right_thin.svg'

type CommentData = {
  author: string
  content: string
  timestamp: string
  replies?: CommentData[]
}

interface CommentProps {
  comment: CommentData
  isReply?: boolean
  className?: string
  /** 본인 댓글일 때만 넘긴다. 없으면 수정·삭제가 보이지 않는다. */
  onEdit?: (content: string) => void
  onDelete?: () => void
  isSaving?: boolean
}

const Comment = ({
  comment,
  isReply = false,
  className,
  onEdit,
  onDelete,
  isSaving = false,
}: CommentProps): ReactElement => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(comment.content)

  const canManage = !!onEdit || !!onDelete

  const handleSave = () => {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false)
      return
    }
    onEdit?.(trimmed)
    setIsEditing(false)
  }

  return (
    <div className={className}>
      <div className={clsx('flex gap-1')}>
        {isReply && <ArrowDownRightIcon className="size-6 fill-gray-600" aria-hidden />}
        <div className="flex grow flex-col gap-3 rounded-xl bg-gray-100 p-3.5">
          <span className="text-c1-regular text-black">{comment.author}</span>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                aria-label="댓글 수정"
                className="text-b2-regular resize-none rounded-md border border-gray-300 bg-white p-2 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-600/40 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(comment.content)
                    setIsEditing(false)
                  }}
                  className="text-c1-regular rounded px-2 py-1 text-gray-600 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !draft.trim()}
                  className="text-c1-regular rounded bg-green-600 px-2 py-1 text-gray-50 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-b2-regular whitespace-pre-wrap text-gray-800">{comment.content}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-c1-regular text-gray-500">{comment.timestamp}</span>

            {canManage && !isEditing && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(comment.content)
                      setIsEditing(true)
                    }}
                    className="text-c1-regular rounded text-gray-600 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                  >
                    수정
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="text-c1-regular rounded text-gray-500 underline focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                  >
                    삭제
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply, index) => (
            <Comment key={`${comment.author}-${index}`} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  )
}

export default Comment
