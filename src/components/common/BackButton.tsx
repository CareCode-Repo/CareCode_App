'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import IconButton from './top-navbar/IconButton'
import BackIcon from '@/assets/icons/arrow_left.svg'

export const BackButton = ({
  onBackButtonClick,
}: {
  onBackButtonClick?: () => void
}): ReactElement => {
  const router = useRouter()

  const handleClick = () => {
    if (onBackButtonClick) {
      onBackButtonClick()
    } else {
      router.back()
    }
  }

  return (
    <IconButton
      icon={BackIcon}
      iconClassName="fill-black size-6"
      aria-label="뒤로 가기"
      onClick={handleClick}
    />
  )
}
