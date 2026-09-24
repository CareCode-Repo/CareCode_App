import clsx from 'clsx'
import { ReactElement } from 'react'
import TopNavBar from './top-navbar'
import { LayoutProps } from '@/types/layout'

export const Layout = (props: LayoutProps): ReactElement => {
  const { hasTopNav, children, contentClassName } = props

  return (
    <div className="flex h-full flex-col">
      {hasTopNav && <TopNavBar {...props} />}

      <main className={clsx('flex grow flex-col overflow-y-scroll bg-gray-50', contentClassName)}>
        {children}
      </main>
    </div>
  )
}

export default Layout
