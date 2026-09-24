'use client'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { ReactElement, useCallback, useState } from 'react'
import HistoryIcon from '@/assets/icons/clock_small.svg'
import AuthGuard from '@/components/common/AuthGuard'
import TopNavBar from '@/components/common/top-navbar'
import ChatContainer from '@/components/features/chat/ChatContainer'
import ChatInput from '@/components/features/chat/ChatInput'
import ChatRecommendationList from '@/components/features/chat/chat-recommnendation-list'
import { useChatMessages } from '@/components/features/chat/hooks/useChatMessages'

const Chat = (): ReactElement => {
  const router = useRouter()
  const { messages, recommendations, sendMessage, isSending } = useChatMessages()
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || isSending) return

    sendMessage({ message: inputValue })
    setInputValue('')
  }, [inputValue, isSending, sendMessage])

  // 추천 메시지 클릭 핸들러
  const handleRecommendationClick = useCallback(
    (text: string) => {
      sendMessage({ message: text })
    },
    [sendMessage],
  )

  return (
    // 챗봇은 사용자별 대화 기록을 남긴다. 로그인 없이 들어오면 보낼 수 없다.
    <AuthGuard>
      <div className="flex h-full flex-col bg-gray-50">
        {/* 탭의 최상위 화면이라 뒤로 가기를 두지 않는다. */}
        <TopNavBar
          title="챗봇 상담"
          actionButtons={[
            {
              icon: HistoryIcon,
              'aria-label': '지난 상담 내역',
              iconClassName: 'size-6 fill-gray-700',
              onClick: () => router.push('/chat/history'),
            },
          ]}
        />

        <div className="flex flex-1 flex-col overflow-hidden px-5 pb-5">
          <ChatContainer messages={messages} />
          <div className="flex flex-col gap-3">
            {/* 추천 메시지 리스트 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChatRecommendationList
                recommendations={recommendations}
                onRecommendationClick={handleRecommendationClick}
              />
            </motion.div>

            {/* 메시지 입력 영역 */}
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={isSending}
              placeholder={isSending ? '전송 중...' : '메시지를 입력하세요...'}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

export default Chat
