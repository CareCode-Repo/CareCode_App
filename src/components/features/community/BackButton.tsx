'use client'
import { useRouter } from 'next/navigation'
import { JSX } from 'react'
import ArrowLeftIcon from '@/assets/icons/arrow_left.svg'

const BackButton = (): JSX.Element => {
  const router = useRouter()
  return (
    <button onClick={() => router.back()}>
      <ArrowLeftIcon className="size-6 fill-black" />
    </button>
  )
}

export default BackButton
