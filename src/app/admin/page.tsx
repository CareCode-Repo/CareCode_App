'use client'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import ErrorView from '@/components/common/Error'
import Separator from '@/components/common/Separator'
import UserTrendChart from '@/components/features/admin/UserTrendChart'
import { useAdminDashboard } from '@/queries/admin'

/** 자주 쓰는 순서로 둔다. 운영 중 손이 가장 많이 가는 것이 위쪽. */
const SECTION_GROUPS = [
  {
    title: '운영',
    items: [
      { href: '/admin/reports', label: '신고 처리', description: '숨김·반려' },
      { href: '/admin/bookings', label: '예약 관리', description: '확정·반려·현황' },
      { href: '/admin/users', label: '사용자 관리', description: '역할 변경·계정 상태' },
      { href: '/admin/community', label: '게시글 관리', description: '부적절한 글 삭제' },
    ],
  },
  {
    title: '콘텐츠',
    items: [
      { href: '/admin/policies/manage', label: '정책 등록·수정', description: '재배포 없이 반영' },
      { href: '/admin/policies', label: '정책 검증', description: '지역별 금액 검증률' },
      { href: '/admin/hospitals', label: '병원 관리', description: '목록·삭제' },
      {
        href: '/admin/public-data',
        label: '공공데이터 동기화',
        description: '시설·정책·병원 수집',
      },
    ],
  },
  {
    title: '기타',
    items: [
      { href: '/admin/analytics', label: '지표', description: '퍼널·리텐션·이벤트' },
      { href: '/admin/notifications', label: '알림 관리', description: '발송·삭제' },
      {
        href: '/admin/health-records',
        label: '건강기록 관리',
        description: '민감정보 · 꼭 필요할 때만',
      },
    ],
  },
]

const AdminIndexPage = (): ReactElement => {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useAdminDashboard()

  const stats = [
    { label: '사용자', value: data?.userCount },
    { label: '병원', value: data?.hospitalCount },
    { label: '정책', value: data?.policyCount },
  ]

  return (
    <div className="flex flex-col gap-6">
      {isError ? (
        <ErrorView content="대시보드를 불러오지 못했어요." onRetry={() => refetch()} />
      ) : (
        <>
          <section className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3"
              >
                <span className="text-c1-regular text-gray-600">{stat.label}</span>
                <span className="text-t2-semibold text-gray-900">
                  {isLoading ? '-' : (stat.value?.toLocaleString('ko-KR') ?? '-')}
                </span>
              </div>
            ))}
          </section>

          {!isLoading && data && data.userTrendData.length > 0 && (
            <section className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-b1-semibold text-gray-800">신규 가입 추이</h2>
              <UserTrendChart labels={data.userTrendLabels} data={data.userTrendData} />
            </section>
          )}

          {!isLoading && !!data?.recentActivities.length && (
            <section className="flex flex-col gap-2">
              <h2 className="text-b1-semibold text-gray-800">최근 활동</h2>
              <ul className="flex flex-col rounded-lg border border-gray-200 bg-white">
                {data.recentActivities.map((activity, index) => (
                  <li
                    key={`${activity.desc}-${index}`}
                    className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 last:border-b-0"
                  >
                    <span className="text-b2-regular truncate text-gray-800">{activity.desc}</span>
                    <span className="text-c1-regular shrink-0 text-gray-500">{activity.time}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <Separator />

      <nav className="flex flex-col gap-5" aria-label="관리 메뉴">
        {SECTION_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-2">
            <h2 className="text-b2-semibold text-gray-600">{group.title}</h2>
            <ul className="flex flex-col rounded-lg border border-gray-200 bg-white">
              {group.items.map((section) => (
                <li key={section.href} className="border-b border-gray-200 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => router.push(section.href)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-b1-medium text-gray-800">{section.label}</span>
                      <span className="text-c1-regular text-gray-600">{section.description}</span>
                    </span>
                    <span className="text-b2-regular shrink-0 text-gray-400" aria-hidden>
                      &gt;
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  )
}

export default AdminIndexPage
