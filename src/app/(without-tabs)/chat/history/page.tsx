'use client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ReactElement, useState } from 'react'
import AuthGuard from '@/components/common/AuthGuard'
import EmptyState from '@/components/common/EmptyState'
import ErrorView from '@/components/common/Error'
import Layout from '@/components/common/Layout'
import ChatBubble from '@/components/features/chat/chat-message/ChatBubble'
import { useChatHistory, useChatSessions } from '@/queries/chatbot'
import { toDate } from '@/utils/date'

const formatTimeAgo = (value?: string | null): string => {
  const date = toDate(value)
  if (!date) return ''
  return formatDistanceToNow(date, { addSuffix: true, locale: ko })
}

const SessionMessages = ({ sessionId }: { sessionId: string }): ReactElement => {
  const { data: history = [], isLoading, isError, refetch } = useChatHistory({ sessionId })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-4.5 py-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-4.5 py-3">
        <button
          type="button"
          onClick={() => refetch()}
          className="text-b2-regular text-gray-700 underline"
        >
          대화를 불러오지 못했어요. 다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 bg-gray-50 px-4.5 py-4">
      {/* 서버는 최신순으로 준다. 대화는 시간 순으로 읽는 것이 자연스러우므로 뒤집는다. */}
      {[...history].reverse().map((item) => (
        <div key={item.messageId} className="flex flex-col gap-2">
          <div className="flex justify-end">
            <ChatBubble type="user">{item.message}</ChatBubble>
          </div>
          <div className="flex justify-start">
            <ChatBubble type="assistant">{item.response}</ChatBubble>
          </div>
        </div>
      ))}
    </div>
  )
}

const ChatHistoryContent = (): ReactElement => {
  const { data: sessions = [], isLoading, isError, refetch } = useChatSessions({ size: 20 })
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-3 px-4.5">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </ul>
    )
  }

  if (isError) {
    return <ErrorView content="상담 내역을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="아직 상담 내역이 없어요"
        description={'챗봇에게 궁금한 것을 물어보면\n여기에 대화가 쌓여요.'}
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-gray-200 border-t border-gray-200 bg-white">
      {sessions.map((session) => {
        const isOpen = openSessionId === session.sessionId

        return (
          <li key={session.sessionId}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenSessionId(isOpen ? null : session.sessionId)}
              className="flex w-full flex-col gap-1 px-4.5 py-4 text-left focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
            >
              <span className="text-b1-semibold line-clamp-1 text-gray-800">{session.title}</span>
              <span className="text-b2-regular text-gray-600">
                문답 {session.messageCount}개 · {formatTimeAgo(session.lastActivityAt)}
              </span>
            </button>

            {/* 열었을 때만 그 세션의 기록을 받는다. 전부 미리 받으면 세션 수만큼 요청이 나간다. */}
            {isOpen && <SessionMessages sessionId={session.sessionId} />}
          </li>
        )
      })}
    </ul>
  )
}

const ChatHistoryPage = (): ReactElement => (
  <AuthGuard>
    <Layout hasTopNav hasBackButton title="지난 상담 내역" contentClassName="py-5">
      <ChatHistoryContent />
    </Layout>
  </AuthGuard>
)

export default ChatHistoryPage
