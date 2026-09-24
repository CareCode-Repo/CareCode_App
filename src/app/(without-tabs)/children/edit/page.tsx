'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import ChildEditScreen from '@/components/features/child/ChildEditScreen'

/** 아이 정보 수정 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const ChildEditPage = (): ReactElement => (
  <SearchParamRoute name="childId" render={(childId) => <ChildEditScreen childId={childId} />} />
)

export default ChildEditPage
