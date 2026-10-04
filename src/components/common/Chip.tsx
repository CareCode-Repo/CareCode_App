import clsx from 'clsx'
import { memo, SyntheticEvent } from 'react'
import CloseIcon from '@/assets/icons/close_mid.svg'

interface BaseChipProps {
  size?: 'md' | 'sm'
  shape?: 'square' | 'round'
  color?: 'green' | 'purple' | 'blue' | 'red' | 'yellow' | 'black' | 'white' | 'transparent'
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

interface DeletableChipProps extends BaseChipProps {
  size: 'md'
  deletable: true

  onDelete: () => void
}

interface NonDeletableChipProps extends BaseChipProps {
  size?: 'sm' | 'md'
  deletable?: false
  onDelete?: never
}

type ChipProps = DeletableChipProps | NonDeletableChipProps

const Chip = memo(function Chip({
  size = 'sm',
  shape = 'square',
  color = 'green',
  deletable = false,
  onClick,
  onDelete,
  className,
  children,
}: ChipProps) {
  const handleDelete = (e: SyntheticEvent) => {
    e.stopPropagation()
    onDelete?.()
  }
  /*
   * 누를 수 있는 칩은 button 으로 낸다.
   *
   * onClick 을 단 div 는 Tab 으로 도달할 수 없고 Enter·Space 로도 눌리지 않는다.
   * 지원금 탐색의 카테고리 칩이 전부 이 상태여서 키보드·스위치 컨트롤 사용자에게는
   * 그 기능이 통째로 막혀 있었다. 누르지 않는 표시용 칩은 그대로 div 로 둔다.
   */
  const Root = onClick ? 'button' : 'div'

  return (
    <Root
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={clsx(
        'inline-flex items-center gap-1 font-medium',
        // 누를 수 있는 칩은 한 손 조작에서도 닿아야 한다.
        onClick && 'min-h-11',
        {
          'text-b2-medium px-2': size === 'sm',
          'text-b1-medium py-0.5 pl-3': size === 'md',
          'pr-3': size === 'md' && !deletable,
          'pr-2': size === 'md' && deletable,
        },
        {
          'rounded-sm': shape === 'square',
          'rounded-3xl border border-gray-400': shape === 'round',
        },
        {
          'bg-green-600 text-white': color === 'green',
          'bg-purple text-white': color === 'purple',
          'bg-blue text-white': color === 'blue',
          'bg-red text-white': color === 'red',
          'bg-yellow text-gray-800': color === 'yellow',
          'bg-gray-800 text-white': color === 'black',
          'bg-gray-50 text-gray-700': color === 'white',
          'bg-transparent text-gray-700': color === 'transparent',
        },
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
      {deletable && (
        <button type="button" onClick={handleDelete} aria-label="삭제">
          <CloseIcon
            className={clsx('h-4 w-4', {
              'fill-gray-700': color === 'white' || color === 'transparent',
              'fill-gray-50': color !== 'white' && color !== 'transparent',
            })}
          />
        </button>
      )}
    </Root>
  )
})

export default Chip
