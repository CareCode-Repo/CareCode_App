'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import HealthRecordEditScreen from '@/components/features/health/HealthRecordEditScreen'

/** 건강기록 수정 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const HealthRecordEditPage = (): ReactElement => (
  <SearchParamRoute
    name="recordId"
    render={(recordId) => <HealthRecordEditScreen recordId={recordId} />}
  />
)

export default HealthRecordEditPage
