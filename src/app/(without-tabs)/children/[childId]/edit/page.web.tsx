'use client'
import { ReactElement, use } from 'react'
import ChildEditScreen from '@/components/features/child/ChildEditScreen'

/**
 * 아이 정보 수정 — 웹 전용 라우트.
 *
 * 검색 결과와 공유 링크가 가리키는 읽기 좋은 주소다. 서버가 있어야 그릴 수 있으므로
 * 앱(정적 export) 빌드에서는 확장자(`*.web.tsx`)로 통째로 제외된다. 앱 안에서의 이동은
 * `routes.ts` 를 거쳐 쿼리 라우트로 간다.
 */
const ChildEditWebPage = ({ params }: { params: Promise<{ childId: string }> }): ReactElement => {
  const { childId } = use(params)
  return <ChildEditScreen childId={childId} />
}

export default ChildEditWebPage
