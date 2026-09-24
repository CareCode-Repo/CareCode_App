import * as RadixSwitch from '@radix-ui/react-switch'
import clsx from 'clsx'
import { ComponentProps, forwardRef } from 'react'

interface SwitchProps extends ComponentProps<typeof RadixSwitch.Root> {
  className?: string
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({ className, ...props }, ref) => {
  return (
    <RadixSwitch.Root
      ref={ref}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        'focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 focus-visible:outline-none',
        'data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block h-5 w-5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </RadixSwitch.Root>
  )
})

Switch.displayName = 'Switch'
export default Switch
