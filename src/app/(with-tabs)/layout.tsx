import { ReactElement, ReactNode } from 'react'
import TabBar from '@/components/common/tab-bar'

const WithTabsLayout = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-hide grow overflow-y-scroll">{children}</div>
      <TabBar />
    </div>
  )
}

export default WithTabsLayout
