'use client'
import { ReactElement, use } from 'react'
import LegalDocumentScreen from '@/components/features/legal/LegalDocumentScreen'

/**
 * 웹 전용. `/legal/terms` 같은 읽기 좋은 주소로 열린다.
 * sitemap.xml 이 이 주소를 싣고, 가입 화면의 약관 링크도 밖으로 나갈 때는 이쪽을 쓴다.
 * 앱 빌드에는 포함되지 않는다(`*.web.tsx`) — 정적 export 는 `[type]` 을 미리 그릴 수 없다.
 */
const LegalDocumentWebPage = ({ params }: { params: Promise<{ type: string }> }): ReactElement => {
  const { type } = use(params)
  return <LegalDocumentScreen type={type} />
}

export default LegalDocumentWebPage
