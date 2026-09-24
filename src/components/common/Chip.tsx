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
  return (
    <div
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1 font-medium',
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
    </div>
  )
})

export default Chip
