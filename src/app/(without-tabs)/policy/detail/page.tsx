'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import PolicyDetailScreen from '@/components/features/policy/PolicyDetailScreen'

/** 지원금 상세 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const PolicyDetailPage = (): ReactElement => (
  <SearchParamRoute name="id" render={(id) => <PolicyDetailScreen id={id} />} />
)

export default PolicyDetailPage
