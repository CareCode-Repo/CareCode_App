import clsx from 'clsx'
import { ComponentType, ReactElement } from 'react'
// 햄버거, 세팅, 알림 사이즈 32, 색 블랙

export interface IconButtonProps {
  icon: ComponentType<React.SVGProps<SVGSVGElement>>
  iconClassName?: string
  className?: string
  showBadge?: boolean
  onClick?: () => void
  /**
   * 아이콘만 있는 버튼은 접근 가능한 이름이 없다.
   * 스크린리더에는 "버튼" 하나로만 읽히므로 무엇을 하는 버튼인지 반드시 넘겨야 한다.
   */
  'aria-label': string
}

const IconButton = ({
  icon: Icon,
  className = '',
  iconClassName = '',
  showBadge,
  onClick,
  'aria-label': ariaLabel,
}: IconButtonProps): ReactElement => {
  return (
    <button
      // 기본값 submit 이라 폼 안에 놓이면 의도치 않게 제출된다.
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx(
        'inline-block rounded focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
    >
      <div className="relative">
        <Icon className={iconClassName || 'size-8 fill-black'} aria-hidden />
        {showBadge && (
          <div className="bg-red absolute top-0.5 right-0.5 size-3 rounded-full">
            <span className="sr-only">읽지 않음</span>
          </div>
        )}
      </div>
    </button>
  )
}

export default IconButton
