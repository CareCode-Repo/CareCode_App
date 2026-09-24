'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import CameraIcon from '@/assets/icons/camera_small.svg'
import KakaoIcon from '@/assets/icons/logo/kakao.svg'
import PencilIcon from '@/assets/icons/pencil.svg'
import AlertDialog from '@/components/common/AlertDialog'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import Layout from '@/components/common/Layout'
import IconButton from '@/components/common/top-navbar/IconButton'
import MenuList from '@/components/features/mypage/MenuList'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useHasUnreadNotifications } from '@/queries/notification'
import { useLogout, useProfileCompletion, useUserProfile } from '@/queries/user'

/** 서버가 주는 불리언 맵의 키를 사용자가 읽을 수 있는 말로 바꾼다. */
const MISSING_FIELD_LABEL: Record<string, string> = {
  needsRealName: '이름',
  needsPhoneNumber: '전화번호',
  needsBirthDate: '생년월일',
  needsGender: '성별',
  needsAddress: '주소',
}

/**
 * 프로필 완성도 안내.
 *
 * 주소가 비어 있으면 지역별 지원금 비교와 가까운 시설 추천이 아예 동작하지 않는데,
 * 그 사실을 알려주는 곳이 없어서 사용자는 "추천이 원래 비어 있는 화면" 으로 오해한다.
 * 다 채운 사람에게는 아무것도 띄우지 않는다.
 */
const ProfileCompletionBanner = (): ReactElement | null => {
  const router = useRouter()
  const { data } = useProfileCompletion()

  if (!data || data.complete) return null

  // 서버는 `{ needsAddress: true }` 처럼 불리언 맵으로 준다. true 인 것만 빠진 항목이다.
  const missing = Object.entries(data.missingFields ?? {})
    .filter(([, needed]) => needed)
    .map(([field]) => MISSING_FIELD_LABEL[field] ?? field)

  return (
    <button
      type="button"
      onClick={() => router.push('/mypage/edit')}
      className="mx-4.5 mt-4.5 flex flex-col gap-1 rounded-lg border border-green-300 bg-green-50 p-3.5 text-left focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
    >
      <span className="text-b1-semibold text-gray-800">
        {data.completionPercentage != null
          ? `프로필을 ${data.completionPercentage}% 채웠어요`
          : '프로필을 마저 채워주세요'}
      </span>
      <span className="text-b2-regular text-gray-700">
        {missing.length
          ? `${missing.slice(0, 3).join(', ')}을(를) 넣으면 지역별 지원금과 가까운 시설을 찾아드려요.`
          : '남은 항목을 채우면 더 정확한 지원금을 추천해드려요.'}
      </span>
    </button>
  )
}

const MyPage = (): ReactElement => {
  const router = useRouter()
  const hasUnread = useHasUnreadNotifications()
  const { data: user, isLoading } = useUserProfile()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const isAdmin = useIsAdmin()

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  return (
    <AuthGuard>
      <Layout
        hasTopNav
        title="마이페이지"
        actionButtons={[
          {
            icon: BellIcon,
            'aria-label': '알림',
            showBadge: hasUnread,
            onClick: () => router.push('/notification'),
          },
        ]}
      >
        <ProfileCompletionBanner />

        {/* 프로필 */}
        <div className="m-4.5 flex items-center gap-3.5 rounded-lg border border-gray-300 bg-white p-3.5">
          <div className="flex items-center justify-center rounded-full bg-gray-300 p-3">
            <CameraIcon className="size-9 fill-black" />
          </div>
          <div className="flex grow flex-col gap-1.5">
            {isLoading ? (
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              <span className="text-b1-semibold text-gray-800">{user?.name || '사용자'}</span>
            )}
            <div className="flex items-center gap-1.5">
              {user?.provider === 'kakao' && (
                <div className="center bg-yellow rounded-xs p-0.5">
                  <KakaoIcon className="size-2.5" />
                </div>
              )}
              <span className="text-c1-regular text-gray-700">
                {user?.email || '이메일 정보 없음'}
              </span>
            </div>
          </div>
          <IconButton
            icon={PencilIcon}
            iconClassName="size-6 fill-gray-700 cursor-pointer"
            aria-label="프로필 수정"
            onClick={() => router.push('/mypage/edit')}
          />
        </div>

        <MenuList
          className="bg-white"
          title="우리 아이"
          items={[
            {
              id: 'children',
              title: '아이 관리·예방접종',
              onClick: () => router.push('/children'),
            },
            { id: 'health', title: '건강 기록', onClick: () => router.push('/health') },
            { id: 'hospital', title: '병원 찾기', onClick: () => router.push('/hospital') },
          ]}
        />
        <MenuList
          className="bg-white"
          title="지원금"
          items={[
            {
              id: 'missed',
              title: '놓친 지원금 찾기',
              onClick: () => router.push('/benefits/missed'),
            },
            {
              id: 'regional',
              title: '지역별 지원금 비교',
              onClick: () => router.push('/benefits/regional'),
            },
          ]}
        />
        <MenuList
          className="bg-white"
          title="나의 활동"
          items={[
            {
              id: 'liked',
              title: '좋아요한 글',
              onClick: () => router.push('/mypage/activity?tab=liked'),
            },
            {
              id: 'bookmarked',
              title: '북마크',
              onClick: () => router.push('/mypage/activity?tab=bookmarked'),
            },
            { id: 'bookings', title: '내 예약', onClick: () => router.push('/mypage/bookings') },
            { id: 'waitlist', title: '내 대기', onClick: () => router.push('/mypage/waitlist') },
            {
              id: 'liked-hospitals',
              title: '찜한 병원',
              onClick: () => router.push('/mypage/liked-hospitals'),
            },
          ]}
        />
        <MenuList
          className="bg-white"
          title="이용 안내"
          items={[
            {
              id: 'notification-settings',
              title: '알림 설정',
              onClick: () => router.push('/notification/settings'),
            },
            {
              id: 'blocked',
              title: '차단한 사용자',
              onClick: () => router.push('/mypage/blocked'),
            },
            {
              id: 'privacy',
              title: '개인정보 설정 및 약관 동의',
              onClick: () => router.push('/mypage/privacy'),
            },
          ]}
        />
        {/* 관리자에게만 노출한다. 실제 접근 통제는 서버가 한다. */}
        {isAdmin && (
          <MenuList
            className="bg-white"
            title="관리자"
            items={[
              { id: 'admin', title: '지표·검증·신고 관리', onClick: () => router.push('/admin') },
            ]}
          />
        )}
        <MenuList
          className="bg-white"
          title="회원 관리"
          items={[
            { id: 'logout', title: '로그아웃', onClick: () => setLogoutDialogOpen(true) },
            { id: 'withdraw', title: '회원탈퇴', onClick: () => router.push('/mypage/privacy') },
          ]}
        />

        <AlertDialog
          title="로그아웃 할까요?"
          description="다시 로그인하면 이어서 이용할 수 있어요."
          isOpen={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
          cancelButton={
            <Button color="gray" size="small" onClick={() => setLogoutDialogOpen(false)}>
              취소
            </Button>
          }
          confirmButton={
            <Button color="green" size="small" onClick={() => logout()} disabled={isLoggingOut}>
              로그아웃
            </Button>
          }
        />
      </Layout>
    </AuthGuard>
  )
}

export default MyPage
