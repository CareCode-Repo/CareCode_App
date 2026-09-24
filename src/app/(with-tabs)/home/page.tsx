'use client'

import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import SearchIcon from '@/assets/icons/search.svg'
import Layout from '@/components/common/Layout'
import MainSection from '@/components/common/MainSection'
import Separator from '@/components/common/Separator'
import Spacer from '@/components/common/Spacer'
import Input from '@/components/common/input'
import ChatSection from '@/components/features/chat/ChatSection'
import PopularPost from '@/components/features/community/popular-post'
import MissedBenefitBanner from '@/components/features/home/MissedBenefitBanner'
import QuickMenu from '@/components/features/home/QuickMenu'
import PolicyCard from '@/components/features/policy/PolicyCard'
import RecommendedPolicyCard from '@/components/features/policy/RecommendedPolicyCard'
import { useGetCommunityPopular } from '@/queries/community'
import { useHasUnreadNotifications } from '@/queries/notification'
import { useGetLatestPolicies, usePolicyRecommendations } from '@/queries/policy'
import { convertPolicyToCardProps } from '@/types/policy'

const Home = (): ReactElement => {
  const router = useRouter()
  const hasUnread = useHasUnreadNotifications()
  const handleNotificationClick = () => router.push('/notification')
  const handleSearchClick = () => router.push('/search')
  const { data: policies, isLoading, error } = useGetLatestPolicies()
  const {
    data: popularPosts,
    isLoading: isPopularLoading,
    error: popularError,
  } = useGetCommunityPopular()
  const { data: recommendations, isLoading: isRecommendationLoading } = usePolicyRecommendations(3)

  return (
    <Layout
      hasTopNav
      title="홈"
      actionButtons={[
        {
          icon: BellIcon,
          'aria-label': '알림',
          showBadge: hasUnread,
          onClick: handleNotificationClick,
        },
      ]}
    >
      <div className="px-4.5">
        <Spacer className="h-5 shrink-0" />
        <Input
          value=""
          placeholder="궁금한 정책이 있으신가요?"
          rightIcon={<SearchIcon className="size-6 cursor-pointer fill-gray-400" />}
          onClick={handleSearchClick}
          readOnly
        />
        <Spacer className="h-5" />
        <div className="flex flex-col gap-4">
          <MissedBenefitBanner />
          <QuickMenu />
          <ChatSection />
          <MainSection title="맞춤 추천">
            <div className="flex flex-col gap-3 px-4 pb-4">
              {isRecommendationLoading ? (
                [0, 1].map((index) => (
                  <div key={index} className="h-24 animate-pulse rounded-lg bg-gray-200" />
                ))
              ) : !recommendations?.length ? (
                <p className="text-b2-regular text-gray-600">
                  아이를 등록하면 월령과 거주지에 맞는 지원금을 찾아드려요.
                </p>
              ) : (
                recommendations.map((recommendation) => (
                  <RecommendedPolicyCard
                    key={recommendation.policy.id}
                    recommendation={recommendation}
                    onClick={() => router.push(`/policy/${recommendation.policy.id}`)}
                  />
                ))
              )}
            </div>
          </MainSection>
          <MainSection title="최근 정책">
            <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-4 [&>*]:w-64 [&>*]:flex-shrink-0">
              {isLoading ? (
                <div className="h-40 w-64 animate-pulse rounded-lg bg-gray-200" />
              ) : error ? (
                <div className="flex h-40 w-64 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  정책 목록을 불러올 수 없습니다.
                </div>
              ) : (
                policies?.map((policy) => {
                  const cardProps = convertPolicyToCardProps(policy)
                  return <PolicyCard key={cardProps.id} {...cardProps} />
                })
              )}
            </div>
          </MainSection>
          <MainSection title="인기 게시글">
            <div className="flex flex-col px-4 pb-4">
              {isPopularLoading ? (
                [...Array(5).keys()].map((index) => (
                  <div key={index}>
                    <div className="flex h-16 animate-pulse items-center py-2">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/2 rounded bg-gray-200" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-12 rounded bg-gray-200" />
                        <div className="h-6 w-12 rounded bg-gray-200" />
                      </div>
                    </div>
                    {index < 4 && <Separator />}
                  </div>
                ))
              ) : popularError ? (
                <div className="flex h-40 items-center justify-center text-red-600">
                  인기 게시글을 불러올 수 없습니다.
                </div>
              ) : (
                popularPosts?.content?.map((post, index) => (
                  <div key={post.postId}>
                    <PopularPost
                      content={post.title}
                      likeCount={post.likeCount}
                      commentCount={post.commentCount}
                      createdDate={format(new Date(post.createdAt), 'MM-dd')}
                      createdTime={format(new Date(post.createdAt), 'HH:mm')}
                      onClick={() => router.push(`/community/${post.postId}`)}
                    />
                    {index < popularPosts.content.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
          </MainSection>
        </div>
        <Spacer className="h-5" />
      </div>
    </Layout>
  )
}

export default Home
