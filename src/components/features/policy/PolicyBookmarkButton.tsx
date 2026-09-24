'use client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import { getAccessToken } from '@/apis/auth'
import BookmarkIcon from '@/assets/icons/star_small.svg'
import { usePolicyBookmarks, useTogglePolicyBookmark } from '@/queries/policy'

interface PolicyBookmarkButtonProps {
  policyId: number
  className?: string
}

const PolicyBookmarkButton = ({ policyId, className }: PolicyBookmarkButtonProps): ReactElement => {
  const router = useRouter()
  const { data: bookmarks = [] } = usePolicyBookmarks()
  const { mutate: toggle, isPending } = useTogglePolicyBookmark()

  // 서버가 정책 단건 응답에 북마크 여부를 주지 않아 목록으로 판단한다.
  // (북마크 수가 많지 않은 화면이라 목록 조회로 충분하다)
  const bookmarked = bookmarks.some((bookmark) => Number(bookmark.policyId) === policyId)

  const handleClick = () => {
    if (!getAccessToken()) {
      router.push('/')
      return
    }
    toggle({ policyId, bookmarked })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? '북마크 해제' : '북마크'}
      className={clsx(
        'flex items-center gap-1 rounded-full border px-3 py-1.5 transition-colors disabled:opacity-50',
        bookmarked
          ? 'border-green-600 bg-green-50 text-green-700'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50',
        className,
      )}
    >
      <BookmarkIcon className={clsx('size-4', bookmarked ? 'fill-green-600' : 'fill-gray-500')} />
      <span className="text-b2-semibold">{bookmarked ? '저장됨' : '저장'}</span>
    </button>
  )
}

export default PolicyBookmarkButton
