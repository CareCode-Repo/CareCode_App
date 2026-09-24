import clsx from 'clsx'
import { ReactElement, ReactNode } from 'react'

interface MainSectionProps {
  title: string
  className?: string
  children?: ReactNode
}

const MainSection = ({ title, className, children }: MainSectionProps): ReactElement => {
  return (
    <div
      className={clsx(
        'flex flex-col gap-4.5 rounded-lg border border-gray-100 bg-white',
        className,
      )}
    >
      <h1 className="text-t2-semibold px-4 pt-4 text-black">{title}</h1>
      {children}
    </div>
  )
}

export default MainSection
