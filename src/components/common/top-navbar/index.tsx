import clsx from 'clsx'
import { ReactElement } from 'react'
import { BackButton } from '../BackButton'
import IconButton, { IconButtonProps } from './IconButton'

export interface TopNavBarProps {
  title?: string
  actionButtons?: IconButtonProps[]
  hasBackButton?: boolean
  onBackButtonClick?: () => void
  isSticky?: boolean
}

const TopNavBar = ({
  title,
  actionButtons = [],
  hasBackButton = false,
  onBackButtonClick,
  isSticky = false,
}: TopNavBarProps): ReactElement => {
  return (
    <div className={clsx('flex items-center bg-white px-5 py-4', isSticky && 'sticky top-0')}>
      {/* back */}
      {hasBackButton && <BackButton onBackButtonClick={onBackButtonClick} />}
      {/* title */}
      {/*
        화면의 제목이다. div 로 두면 "제목으로 이동" 탐색이 성립하지 않고, 어떤 화면에는
        heading 이 하나도 없게 된다. 제목이 없는 화면에서는 아무것도 그리지 않는다.
      */}
      {title ? (
        <h1 className="text-h3-bold h-8 grow content-center pl-2.5 text-black">{title}</h1>
      ) : (
        <div className="h-8 grow" />
      )}
      {/* action buttons */}
      <div className="flex items-center gap-2.5">
        {actionButtons.map((button) => (
          <IconButton key={button['aria-label']} {...button} />
        ))}
      </div>
    </div>
  )
}

export default TopNavBar
