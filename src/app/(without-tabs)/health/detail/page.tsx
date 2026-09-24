'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import HealthRecordDetailScreen from '@/components/features/health/HealthRecordDetailScreen'

/** 건강기록 상세 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const HealthRecordDetailPage = (): ReactElement => (
  <SearchParamRoute
    name="recordId"
    render={(recordId) => <HealthRecordDetailScreen recordId={recordId} />}
  />
)

export default HealthRecordDetailPage
