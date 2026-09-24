'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import CommunityPostEditScreen from '@/components/features/community/CommunityPostEditScreen'

/** 게시글 수정 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const CommunityPostEditPage = (): ReactElement => (
  <SearchParamRoute name="id" render={(id) => <CommunityPostEditScreen id={id} />} />
)

export default CommunityPostEditPage
