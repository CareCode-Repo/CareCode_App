'use client'

import { ReactElement, useState } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import KebabIcon from '@/assets/icons/edit.svg'
import HamburgerIcon from '@/assets/icons/hamburger.svg'
import PaperIcon from '@/assets/icons/paper_small.svg'
import PencilIcon from '@/assets/icons/pencil.svg'
import SearchIcon from '@/assets/icons/search.svg'
import SettingIcon from '@/assets/icons/setting.svg'
import TrachIcon from '@/assets/icons/trash.svg'
import WarningIcon from '@/assets/icons/warning.svg'
import AlertDialog from '@/components/common/AlertDialog'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import Error from '@/components/common/Error'
import MainSection from '@/components/common/MainSection'
import Separator from '@/components/common/Separator'
import Switch from '@/components/common/Switch'
import ToggleButton from '@/components/common/ToggleButton'
import ToggleChip from '@/components/common/ToggleChip'
import Input from '@/components/common/input'
import Loading from '@/components/common/loading'
import { Menubox } from '@/components/common/menubox'
import TabBar from '@/components/common/tab-bar'
import TopNavBar from '@/components/common/top-navbar'
import IconButton from '@/components/common/top-navbar/IconButton'
import ChatSection from '@/components/features/chat/ChatSection'
import ChatMessage from '@/components/features/chat/chat-message'
import ChatRecommendationList from '@/components/features/chat/chat-recommnendation-list'
import ActionButton from '@/components/features/community/ActionButton'
import Comment from '@/components/features/community/Comment'
import PopularPost from '@/components/features/community/popular-post'
import FacilityCard from '@/components/features/facility/facility-card'
import MenuList from '@/components/features/mypage/MenuList'
import NotificationCard from '@/components/features/notification/NotificationCard'
import PolicyCard from '@/components/features/policy/PolicyCard'

export default function ComponentTest(): ReactElement {
  const [value, setValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const handleClose = () => setIsOpen(false)

  const handleChange = (newValue: string) => setValue(newValue)

  const mockComment = {
    author: '하늘이야빠',
    content: '모빌 정말 추천해요! 시각 발달에도 도움 된다고 하더라고요.',
    timestamp: '08/10 20:27',
    replies: [
      {
        author: '하늘이야빠',
        content: '모빌 정말 추천해요!',
        timestamp: '08/10 20:28',
      },
      {
        author: '하늘이야빠',
        content: '시각 발달에도 도움 된다고 하더라고요.',
        timestamp: '08/10 22:27',
      },
    ],
  }
  const mockMenuItems = [
    {
      id: '1',
      title: '소메뉴',
      onClick: () => console.log('1'),
    },
    {
      id: '2',
      title: '소메뉴',
      onClick: () => console.log('2'),
    },
    {
      id: '3',
      title: '소메뉴',
      onClick: () => console.log('3'),
    },
  ]
  if (showError) return <Error onRetry={() => setShowError(false)} />

  return (
    <div className="flex flex-col">
      <h1 className="mb-4 text-2xl font-bold">Component Test Page</h1>
      {/* Error 컴포넌트 테스트 */}
      <Button color="red" onClick={() => setShowError(!showError)}>
        Error 발생
      </Button>
      {/* Loading 컴포넌트 테스트 */}
      <div className="mb-4">
        <Button color="green" size="large" onClick={() => setShowLoading(!showLoading)}>
          {showLoading ? 'Hide Loading' : 'Show Loading'}
        </Button>
        {showLoading && <Loading content={`회원가입 처리중입니다 \n 잠시만 기다려주세요`} />}
      </div>
      {/* 인풋 컴포넌트 테스트 */}
      <Input
        value={value}
        label="주소"
        required
        onChange={handleChange}
        placeholder="주소를 입력하세요"
        maxLength={50}
        rightIcon={<SearchIcon className="size-6 cursor-pointer fill-gray-400" />}
      />
      <Input value={value} label="이메일" onChange={handleChange} />
      <Input
        value={value}
        label="주소"
        onChange={handleChange}
        errorText="유효하지 않습니다."
        placeholder="주소를 입력하세요"
        showErrorText
      />
      <Input
        value={value}
        onChange={handleChange}
        variant="rounded"
        rightIcon={<PaperIcon className="size-6 cursor-pointer fill-gray-600" />}
      />
      {/* 탑네브바 테스트 */}
      <TopNavBar
        title="회원가입"
        hasBackButton
        actionButtons={[
          { icon: SettingIcon, 'aria-label': '설정' },
          { icon: BellIcon, 'aria-label': '알림', showBadge: true },
        ]}
      />
      <TopNavBar title="회원가입" hasBackButton />
      <div>
        <IconButton icon={SettingIcon} aria-label="설정" />
        <IconButton icon={BellIcon} aria-label="알림" />
        <IconButton icon={HamburgerIcon} aria-label="메뉴" />
        <IconButton icon={BellIcon} aria-label="알림" showBadge />
      </div>
      {/* 탭바 테스트 */}
      <TabBar />
      <div className="flex flex-col gap-2 p-5">
        <ChatSection />
        <div>
          {/* button 테스트 */}
          <Button color="green" size="large" disabled>
            Green Full Button
          </Button>
          {/* svg 아이콘 테스트 */}
          <WarningIcon className="fill-red h-6 w-6" />
          {/* alert 다이얼로그 테스트 */}
          <Button color="green" size="large" onClick={() => setIsOpen(true)}>
            버튼
          </Button>
          <AlertDialog
            title="Dialog Title"
            description="This is a description for the dialog."
            isOpen={isOpen}
            onClose={handleClose}
            cancelButton={
              <Button color="gray" size="small" onClick={handleClose}>
                Cancel
              </Button>
            }
            confirmButton={
              <Button color="red" size="small" onClick={handleClose}>
                Confirm
              </Button>
            }
          />
          {/* 드롭다운메뉴 테스트 */}
          <Menubox
            triggerButton={<KebabIcon className="h-6 w-6 cursor-pointer fill-black" />}
            items={[
              {
                content: '수정',
                icon: PencilIcon,
                onSelect: () => console.log('수정 클릭됨'),
              },
              {
                content: '삭제',
                icon: TrachIcon,
                variant: 'destructive',
                onSelect: () => console.log('삭제 클릭됨'),
              },
            ]}
          />
          {/* 스위치 테스트 */}
          <Switch />
          {/* 토글버튼 테스트 */}
          <ToggleButton onPressedChange={() => console.log('토글 상태 변경됨')}>부모</ToggleButton>
          {/* 칩, 토글칩 테스트 */}
          <ToggleChip onPressedChange={() => console.log('토글칩 상태 변경됨')}>Chip</ToggleChip>
          <Chip size="sm">Text</Chip>
          <Chip size="md" color="purple">
            Text
          </Chip>
          <Chip size="md" color="blue" shape="round">
            Text
          </Chip>
          <Chip
            size="md"
            color="white"
            shape="round"
            deletable
            onDelete={() => console.log('칩 삭제됨')}
          >
            Text
          </Chip>
          <Chip
            size="md"
            color="black"
            shape="round"
            deletable
            onDelete={() => console.log('칩 삭제됨')}
          >
            Text
          </Chip>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <PolicyCard
            id={1}
            type="상시접수"
            tags={['건강검진', '서비스지원']}
            title="경기형 가족돌봄수당"
            description="생후 24~48개월 미만 아동 돌보는 친인척/이웃에게 60만원"
            region="경기도 '건강검진', '서비스지원' 생후 24~48개월 미만 아동 돌보는 친인척/이웃에게 60만원 생후 24~48개월 미만 아동 돌보는 친인척/이웃에게 60만원"
            targetAge="생후 24개월 ~ 48개월 미만 아동대상"
            applicationPeriod="매월 1~15일 온라인 신청"
            onClick={() => console.log('정책 카드 클릭됨')}
          />
          <FacilityCard
            type="어린이집"
            tags={['건강검진', '서비스지원']}
            title="아이사랑 어린이집"
            region="경기도 고양시 일산동구"
            phoneNumber="031-123-4567"
            reviewCount={10}
            rating={4.5}
            onClick={() => console.log('시설 카드 클릭됨')}
          />
        </div>
        <div>
          <ChatMessage
            message="그렇군요. 어떤 종류의 육아 고민이신가요? 지금 겪고 계신 상황이나 걱정되는 점을 말씀해주시면, 구체적으로 도와드릴 수 있어요. 
                  예를 들어: 아이의 수면 습관이나 식사 문제, 감정 표현, 떼쓰기, 말 안 듣는 행동,유치원 적응이나 형제·자매 관계,
                  부모로서의 양육 스트레스 등 어떤 이야기든 괜찮으니, 편하게 말씀해 주세요."
            isMyMessage={false}
          />
          <ChatMessage message="안녕하세요! 어떻게 도와드릴까요?" isMyMessage={true} />
          <div className="flex flex-col gap-2"></div>
          <ChatRecommendationList
            recommendations={[
              '최근 육아정책',
              '육아 꿀템을\n추천해줘',
              '태교에 좋은 \n노래 5가지 추천해줘',
              '육아 관련 책\n추천해줘',
              '태교에 좋은 \n노래 5가지 추천해줘',
            ]}
            onRecommendationClick={(text) => console.log(`클릭됨: ${text}`)}
          />
          <NotificationCard
            timeAgo="2시간 전"
            title="새로운 정책이 등록되었습니다"
            content="경기도에서 새로운 가족돌봄수당 정책이 등록되었습니다. 자세한 내용은 정책 페이지를 확인하세요. 알림 내용 텍스트입니다.알림 내용 텍스트입니다."
            isRead={false}
            onClick={() => console.log('알림 카드 클릭됨')}
          />
          <NotificationCard
            timeAgo="2시간 전"
            title="새로운 정책이 등록되었습니다"
            content="경기도에서 새로운 가족돌봄수당 정책이 등록되었습니다. 자세한 내용은 정책 페이지를 확인하세요. 알림 내용 텍스트입니다.알림 내용 텍스트입니다."
            isRead={true}
            onClick={() => console.log('알림 카드 클릭됨')}
          />
        </div>
        <div>
          <div className="flex gap-4.5">
            <ActionButton type="like" count={10} onClick={() => console.log('북마크 클릭됨')} />
            <ActionButton type="comment" count={10} onClick={() => console.log('북마크 클릭됨')} />
          </div>
        </div>
        <div>
          <Comment comment={mockComment} />
        </div>
      </div>
      <MenuList title="메뉴분류" items={mockMenuItems} />
      <div className="flex flex-col p-4">
        <MainSection title="최근 정책">
          <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 [&>*]:w-64 [&>*]:flex-shrink-0">
            <PolicyCard
              id={1}
              type="상시접수"
              tags={['건강검진', '서비스지원']}
              title={`정책 카드 1`}
              description="생후 24~48개월 60만원"
              region="경기도"
              targetAge="생후 24개월 ~ 48개월 미만 아동대상"
              applicationPeriod="매월 1~15일 온라인 신청"
              onClick={() => console.log(`정책 카드 1 클릭됨`)}
            />
            <PolicyCard
              id={2}
              type="상시접수"
              tags={['건강검진', '서비스지원']}
              title={`정책 카드 1`}
              description="생후 24~48개월 60만원 생후 24~48개월 60만원 생후 24~48개월 60만원"
              region="경기도"
              targetAge="생후 24개월 ~ 48개월 미만 아동대상"
              applicationPeriod="매월 1~15일 온라인 신청"
              onClick={() => console.log(`정책 카드 1 클릭됨`)}
            />
          </div>
        </MainSection>
        <MainSection title="인기 게시글">
          <div className="flex flex-col px-4">
            <PopularPost
              content="이것은 인기 게시글의 내용입니다."
              likeCount={10}
              commentCount={5}
              createdDate="2023-10-01"
              createdTime="12:00"
            />
            <Separator />
            <PopularPost
              content="이것은 인기 게시글의 내용입니다. 여러 줄로 작성할 수 있습니다.dddddd"
              likeCount={10}
              commentCount={5}
              createdDate="2023-10-01"
              createdTime="12:00"
            />
          </div>
        </MainSection>
      </div>
    </div>
  )
}
