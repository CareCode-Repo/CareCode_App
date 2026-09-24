'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import PolicyCategoryScreen from '@/components/features/policy/PolicyCategoryScreen'

/** 카테고리별 지원금 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const PolicyCategoryPage = (): ReactElement => (
  <SearchParamRoute
    name="category"
    render={(category) => <PolicyCategoryScreen category={category} />}
  />
)

export default PolicyCategoryPage
