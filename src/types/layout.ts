import { ReactNode } from 'react'
import { TopNavBarProps } from '@/components/common/top-navbar'

type BaseLayoutProps = {
  children: ReactNode
  contentClassName?: string
}

type LayoutWithTopNavProps = BaseLayoutProps &
  TopNavBarProps & {
    hasTopNav: true
  }

type LayoutWithoutTopNavProps = BaseLayoutProps & {
  hasTopNav: false
}

export type LayoutProps = LayoutWithTopNavProps | LayoutWithoutTopNavProps
