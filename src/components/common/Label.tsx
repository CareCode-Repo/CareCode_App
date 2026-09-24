import * as RadixLabel from '@radix-ui/react-label'
import clsx from 'clsx'
import { ComponentProps, forwardRef, ComponentRef } from 'react'

interface LabelProps extends ComponentProps<typeof RadixLabel.Root> {
  children: React.ReactNode
  required?: boolean
  className?: string
}

const Label = forwardRef<ComponentRef<typeof RadixLabel.Root>, LabelProps>(
  ({ children, required = false, className, ...props }, ref) => {
    return (
      <RadixLabel.Root
        ref={ref}
        className={clsx('text-t1-semibold mb-3.5 text-black', className)}
        {...props}
      >
        {children}
        {required && <span className="text-b2-medium text-red ml-0.5 align-super">*</span>}
      </RadixLabel.Root>
    )
  },
)

Label.displayName = 'Label'

export default Label
