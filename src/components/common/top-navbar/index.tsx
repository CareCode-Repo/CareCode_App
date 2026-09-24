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
      <div className="text-h3-bold h-8 grow content-center pl-2.5 text-black">{title}</div>
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
