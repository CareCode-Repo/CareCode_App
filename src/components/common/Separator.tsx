import clsx from 'clsx'
import { ReactElement } from 'react'

interface SeparatorProps {
  className?: string
}

const Separator = ({ className }: SeparatorProps): ReactElement => {
  return <div className={clsx('h-px bg-gray-300', className)} />
}

export default Separator
