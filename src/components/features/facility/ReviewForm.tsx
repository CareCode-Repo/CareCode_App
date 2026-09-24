'use client'
import clsx from 'clsx'
import { ReactElement, useState } from 'react'
import StarIcon from '@/assets/icons/star_small.svg'
import Button from '@/components/common/Button'
import { FacilityReviewBody } from '@/types/apis/facility'

interface ReviewFormProps {
  isPending?: boolean
  onSubmit: (body: FacilityReviewBody) => void
}

const RATINGS = [1, 2, 3, 4, 5]

const ReviewForm = ({ isPending = false, onSubmit }: ReviewFormProps): ReactElement => {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')

  const canSubmit = rating > 0 && content.trim().length > 0 && !isPending

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ rating, content: content.trim() })
    setRating(0)
    setContent('')
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4"
      onSubmit={handleSubmit}
    >
      <span className="text-b1-semibold text-gray-800">리뷰 남기기</span>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="별점">
        {RATINGS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value}점`}
            onClick={() => setRating(value)}
          >
            <StarIcon
              className={clsx('size-6', value <= rating ? 'fill-yellow' : 'fill-gray-300')}
            />
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="다른 부모님께 도움이 될 경험을 남겨주세요."
        className="text-b1-regular resize-none rounded-md border border-gray-300 p-3 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-600/40 focus:outline-none"
      />

      <Button type="submit" color="green" size="small" disabled={!canSubmit}>
        {isPending ? '등록 중...' : '리뷰 등록'}
      </Button>
    </form>
  )
}

export default ReviewForm
