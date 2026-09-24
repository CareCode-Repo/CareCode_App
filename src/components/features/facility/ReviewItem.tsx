'use client'
import { ReactElement, useState } from 'react'
import StarIcon from '@/assets/icons/star_small.svg'
import Button from '@/components/common/Button'
import { formatDate } from '@/utils/date'

interface ReviewItemProps {
  rating?: number | null
  content?: string | null
  createdAt?: string | null
  authorName?: string | null
  /** 본인 리뷰일 때만 넘긴다. 없으면 수정·삭제가 보이지 않는다. */
  onEdit?: (body: { rating: number; content: string }) => void
  onDelete?: () => void
  isSaving?: boolean
}

const RATINGS = [1, 2, 3, 4, 5]

/** 시설·병원 리뷰가 같은 모양이라 한 컴포넌트로 쓴다. */
const ReviewItem = ({
  rating,
  content,
  createdAt,
  authorName,
  onEdit,
  onDelete,
  isSaving = false,
}: ReviewItemProps): ReactElement => {
  const [isEditing, setIsEditing] = useState(false)
  const [draftRating, setDraftRating] = useState(rating ?? 5)
  const [draftContent, setDraftContent] = useState(content ?? '')

  const canManage = !!onEdit || !!onDelete

  const startEditing = () => {
    setDraftRating(rating ?? 5)
    setDraftContent(content ?? '')
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmed = draftContent.trim()
    if (!trimmed) return
    onEdit?.({ rating: draftRating, content: trimmed })
    setIsEditing(false)
  }

  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <StarIcon className="fill-yellow size-4" aria-hidden />
          <span className="text-b1-semibold text-gray-800">{rating ?? '-'}</span>
          {authorName && <span className="text-c1-regular pl-1 text-gray-500">{authorName}</span>}
        </div>
        <span className="text-c1-regular text-gray-500">{formatDate(createdAt)}</span>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-1" role="group" aria-label="별점">
            {RATINGS.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value}점`}
                aria-pressed={draftRating === value}
                onClick={() => setDraftRating(value)}
                className="rounded p-0.5 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
              >
                <StarIcon
                  className={value <= draftRating ? 'fill-yellow size-6' : 'size-6 fill-gray-300'}
                  aria-hidden
                />
              </button>
            ))}
          </div>
          <textarea
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            rows={3}
            maxLength={1000}
            aria-label="리뷰 내용"
            className="text-b1-regular resize-none rounded-md border border-gray-300 p-3 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-600/40 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              size="small"
              className="w-auto px-4"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
            <Button
              color="green"
              size="small"
              className="w-auto px-4"
              disabled={isSaving || !draftContent.trim()}
              onClick={handleSave}
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-b1-regular whitespace-pre-line text-gray-700">{content}</p>
      )}

      {canManage && !isEditing && (
        <div className="flex justify-end gap-3 pt-1">
          {onEdit && (
            <button
              type="button"
              onClick={startEditing}
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
    </li>
  )
}

export default ReviewItem
