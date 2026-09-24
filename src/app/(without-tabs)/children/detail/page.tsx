'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import ChildDetailScreen from '@/components/features/child/ChildDetailScreen'

/** 아이 상세 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const ChildDetailPage = (): ReactElement => (
  <SearchParamRoute name="childId" render={(childId) => <ChildDetailScreen childId={childId} />} />
)

export default ChildDetailPage
