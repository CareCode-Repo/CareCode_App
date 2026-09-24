'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import HospitalDetailScreen from '@/components/features/hospital/HospitalDetailScreen'

/** 병원 상세 — 앱·웹 공용 라우트. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.ts`). */
const HospitalDetailPage = (): ReactElement => (
  <SearchParamRoute name="id" render={(id) => <HospitalDetailScreen id={id} />} />
)

export default HospitalDetailPage
