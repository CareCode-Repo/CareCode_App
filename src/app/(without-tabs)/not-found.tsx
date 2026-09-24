'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import CharacterIcon from '@/assets/icons/characters/error.svg'
import Button from '@/components/common/Button'

/**
 * 상세 화면에서 없는 리소스를 열었을 때(notFound()).
 * 루트 404 와 달리 "홈" 이 아니라 바로 앞 목록으로 돌려보내는 편이 자연스럽다.
 */
const NotFound = (): ReactElement => {
  const router = useRouter()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-gray-50 px-6">
      <CharacterIcon className="size-32" aria-hidden />
      <p className="text-h3-bold text-center whitespace-pre-line text-black">
        {'찾으시는 내용이 없어요.\n삭제되었을 수 있어요.'}
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button color="green" onClick={() => router.back()}>
          이전으로
        </Button>
        <Button color="gray" onClick={() => router.replace('/home')}>
          홈으로 가기
        </Button>
      </div>
    </div>
  )
}

export default NotFound
