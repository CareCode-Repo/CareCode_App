'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import CharacterIcon from '@/assets/icons/characters/error.svg'
import Button from '@/components/common/Button'

const NotFound = (): ReactElement => {
  const router = useRouter()

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-gray-50 px-6">
      <CharacterIcon className="size-32" />
      <p className="text-h3-bold text-center whitespace-pre-line text-black">
        {'요청하신 페이지를 찾을 수 없어요.'}
      </p>
      <Button color="green" onClick={() => router.replace('/home')}>
        홈으로 가기
      </Button>
    </div>
  )
}

export default NotFound
