import { ReactElement, ReactNode } from 'react'

const WithoutTabsLayout = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <div className="flex h-dvh flex-col">
      <div className="scrollbar-hide grow overflow-y-scroll">{children}</div>
    </div>
  )
}

export default WithoutTabsLayout
