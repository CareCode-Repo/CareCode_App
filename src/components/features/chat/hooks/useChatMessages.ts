import { isAxiosError } from 'axios'
import { useCallback } from 'react'
import { getUserId } from '@/apis/auth'
import { usePostChatMessage } from '@/queries/chatbot'
import { useChatStore } from '@/stores/useChatStore'
import { PostChatMessageBody, PostChatMessageResponse } from '@/types/apis/chatbot'
import { ChatMessage, SendMessageOptions, UseChatMessagesReturn } from '@/types/chat'

/**
 * 대화 시작을 돕는 예시 질문.
 * 서버에 추천 질문 엔드포인트가 없어 클라이언트 상수로 둔다. 생기면 이 배열만 교체하면 된다.
 */
const RECOMMENDATIONS = [
  '최근 육아정책',
  '육아 꿀템을\n추천해줘',
  '태교에 좋은\n노래 추천해줘',
  '육아 관련 책\n추천해줘',
  '아이 발달\n단계별 놀이',
]

/** 실패 원인을 사용자가 할 수 있는 일로 바꿔 준다. */
const toErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    // 문자열 매칭(`error.message.includes('401')`)은 문구가 바뀌면 조용히 빗나간다.
    if (!error.response) return '네트워크 연결을 확인해주세요. 인터넷 연결이 불안정합니다.'
    if (error.code === 'ECONNABORTED')
      return '응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
    if (error.response.status === 401) return '인증이 만료되었습니다. 다시 로그인해주세요.'
    if (error.response.status >= 500)
      return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  return '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

export const useChatMessages = (): UseChatMessagesReturn => {
  const { messages, currentSessionId, addMessage, updateMessage, setSessionId } = useChatStore()

  // 메시지 전송 Mutation
  const sendMessageMutation = usePostChatMessage()

  // Mutation 성공/에러 처리를 위한 변수
  const handleMutationSuccess = useCallback(
    (response: PostChatMessageResponse, loadingMessageId: string) => {
      // 세션 ID 저장 (첫 메시지거나 새로운 세션인 경우)
      if (!currentSessionId && response.sessionId) {
        setSessionId(response.sessionId)
      }

      const messageUpdates: Partial<ChatMessage> = {
        message: response.response,
        timestamp: response.timestamp,
        isMyMessage: false,
      }
      updateMessage(loadingMessageId, messageUpdates)
    },
    [updateMessage, currentSessionId, setSessionId],
  )

  const handleMutationError = useCallback(
    (error: unknown, loadingMessageId: string) => {
      console.error('챗봇 응답 실패:', error)
      // 로딩 메시지를 에러 메시지로 교체
      updateMessage(loadingMessageId, { message: toErrorMessage(error) })
    },
    [updateMessage],
  )

  // 메시지 전송 함수
  const sendMessage = useCallback(
    async (options: SendMessageOptions) => {
      if (!options.message.trim() || sendMessageMutation.isPending) return

      // 사용자 식별자는 호출부가 넘기지 않는다. 화면마다 다른 값을 넣을 여지를 없앤다.
      const userId = getUserId()
      if (!userId) {
        console.error('로그인 정보가 없어 챗봇에 보낼 수 없습니다.')
        return
      }

      // 사용자 메시지 추가
      const sentAt = Date.now()
      addMessage({
        id: sentAt.toString(),
        message: options.message,
        isMyMessage: true,
        timestamp: new Date(sentAt).toISOString(),
      })

      // 로딩 메시지 추가
      const loadingMessageId = `loading-${sentAt}`
      addMessage({
        id: loadingMessageId,
        message: '챗봇이 입력 중...',
        isMyMessage: false,
        timestamp: new Date(sentAt).toISOString(),
      })

      // API 호출 - 조건부로 sessionId 포함
      const body: PostChatMessageBody = {
        userId,
        message: options.message,
        ...(currentSessionId && { sessionId: currentSessionId }),
      }

      try {
        const response = await sendMessageMutation.mutateAsync(body)
        handleMutationSuccess(response, loadingMessageId)
      } catch (error) {
        handleMutationError(error, loadingMessageId)
      }
    },
    [sendMessageMutation, addMessage, handleMutationSuccess, handleMutationError, currentSessionId],
  )

  return {
    messages,
    recommendations: RECOMMENDATIONS,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  }
}
