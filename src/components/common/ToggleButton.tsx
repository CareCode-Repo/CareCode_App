import * as Toggle from '@radix-ui/react-toggle'
import clsx from 'clsx'
import { ComponentProps, forwardRef, ComponentRef } from 'react'

interface ToggleButtonProps extends ComponentProps<typeof Toggle.Root> {
  className?: string
}

const ToggleButton = forwardRef<ComponentRef<typeof Toggle.Root>, ToggleButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Toggle.Root
        ref={ref}
        className={clsx(
          'text-b1-regular h-14 min-w-40 rounded-lg border border-gray-400 bg-gray-100 p-2.5 text-center text-gray-800 transition-colors',
          'data-[state=on]:border-green-700 data-[state=on]:bg-green-100 data-[state=on]:text-green-700',
          className,
        )}
        {...props}
      >
        {children}
      </Toggle.Root>
    )
  },
)

ToggleButton.displayName = 'ToggleButton'
export default ToggleButton
