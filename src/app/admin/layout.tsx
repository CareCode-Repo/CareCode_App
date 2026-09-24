'use client'
import { usePathname, useRouter } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'
import AdminGuard from '@/components/common/AdminGuard'
import Layout from '@/components/common/Layout'

/** 경로별 상단 제목. 섹션이 늘어도 레이아웃은 그대로 둔다. */
const TITLES: Record<string, string> = {
  '/admin': '관리자',
  '/admin/analytics': '지표',
  '/admin/users': '사용자 관리',
  '/admin/community': '게시글 관리',
  '/admin/reports': '신고 처리',
  '/admin/policies': '정책 검증',
  '/admin/policies/manage': '정책 등록·수정',
  '/admin/bookings': '예약 관리',
  '/admin/hospitals': '병원 관리',
  '/admin/health-records': '건강기록 관리',
  '/admin/notifications': '알림 관리',
  '/admin/public-data': '공공데이터 동기화',
  '/admin/sample-data': '샘플 데이터',
}

const AdminLayout = ({ children }: { children: ReactNode }): ReactElement => {
  const router = useRouter()
  const pathname = usePathname() ?? '/admin'

  const isIndex = pathname === '/admin'

  return (
    <Layout
      hasTopNav
      hasBackButton
      title={TITLES[pathname] ?? '관리자'}
      // 앱 셸이 모바일 폭이라 탭을 늘리면 넘친다. 인덱스로 돌아가는 흐름으로 둔다.
      onBackButtonClick={() => router.push(isIndex ? '/home' : '/admin')}
    >
      <AdminGuard>
        <div className="px-4.5 py-5">{children}</div>
      </AdminGuard>
    </Layout>
  )
}

export default AdminLayout
