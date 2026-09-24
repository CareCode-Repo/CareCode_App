import { useRouter } from 'next/navigation'
import { JSX } from 'react'
import PencilIcon from '@/assets/icons/pencil.svg'

const NewPostFAB = (): JSX.Element => {
  const router = useRouter()

  return (
    <button
      type="button"
      // 앞에 `/` 가 없으면 현재 URL 기준 상대 경로로 해석돼 진입 지점에 따라 목적지가 달라진다.
      onClick={() => router.push('/community/write')}
      className="absolute right-[1.125rem] bottom-4 z-3 inline-flex items-center justify-center gap-1 rounded-3xl border border-green-600 bg-gray-800 py-3 pr-[0.94rem] pl-[1.13rem] focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="text-b1-medium text-gray-50">글 쓰기</span>
      <PencilIcon className="size-4 fill-gray-50" aria-hidden />
    </button>
  )
}

export default NewPostFAB
