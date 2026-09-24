'use client'
import { ReactElement } from 'react'
import SearchParamRoute from '@/components/common/SearchParamRoute'
import LegalDocumentScreen from '@/components/features/legal/LegalDocumentScreen'

/** 앱·웹 공용. 앱 안에서의 이동은 언제나 이쪽으로 온다(`routes.legalDocument`). */
const LegalDetailPage = (): ReactElement => (
  <SearchParamRoute name="type" render={(type) => <LegalDocumentScreen type={type} />} />
)

export default LegalDetailPage
