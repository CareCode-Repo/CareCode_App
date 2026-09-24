'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import CommunityPostDetailScreen from '@/components/features/community/CommunityPostDetailScreen'

/** 게시글 상세 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const CommunityPostDetailPage = (): ReactElement => (
  <SearchParamRoute name="id" render={(id) => <CommunityPostDetailScreen id={id} />} />
)

export default CommunityPostDetailPage
