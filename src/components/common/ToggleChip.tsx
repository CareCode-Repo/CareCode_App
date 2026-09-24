import * as Toggle from '@radix-ui/react-toggle'
import clsx from 'clsx'
import { forwardRef, ComponentProps, ComponentRef } from 'react'

interface ToggleChipProps extends ComponentProps<typeof Toggle.Root> {
  className?: string
}

const ToggleChip = forwardRef<ComponentRef<typeof Toggle.Root>, ToggleChipProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Toggle.Root
        ref={ref}
        className={clsx(
          'text-b1-medium rounded-3xl border border-gray-400 bg-gray-50 px-3 py-0.5 text-gray-700 transition-colors',
          'data-[state=on]:border-green-900 data-[state=on]:bg-gray-50 data-[state=on]:text-green-900',
          className,
        )}
        {...props}
      >
        {children}
      </Toggle.Root>
    )
  },
)

ToggleChip.displayName = 'ToggleChip'
export default ToggleChip
