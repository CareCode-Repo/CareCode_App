import { createQueryKeys } from '@lukemorales/query-key-factory'
import { useMutation, useQuery, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { getAccessToken } from '@/apis/auth'
import { getChatHistory, getChatSessions, postChatMessage } from '@/apis/chatbot'
import {
  GetChatHistoryQuery,
  GetChatHistoryResponse,
  GetChatSessionsQuery,
  GetChatSessionsResponse,
  PostChatMessageBody,
  PostChatMessageResponse,
} from '@/types/apis/chatbot'

export const chatbotQueryKeys = createQueryKeys('chatbot', {
  history: (query: GetChatHistoryQuery = {}) => ({
    queryKey: [query],
    queryFn: () => getChatHistory(query),
  }),
  sessions: (query: GetChatSessionsQuery = {}) => ({
    queryKey: [query],
    queryFn: () => getChatSessions(query),
  }),
})

export const usePostChatMessage = (): UseMutationResult<
  PostChatMessageResponse,
  Error,
  PostChatMessageBody
> => {
  return useMutation({
    mutationFn: postChatMessage,
  })
}

/** 지난 대화 세션 목록. 사용자는 서버가 토큰에서 꺼내므로 따로 넘기지 않는다. */
export const useChatSessions = (
  query: GetChatSessionsQuery = {},
): UseQueryResult<GetChatSessionsResponse, Error> =>
  useQuery({ ...chatbotQueryKeys.sessions(query), enabled: !!getAccessToken() })

/** 한 세션의 문답 기록. sessionId 를 비우면 전체 기록을 최신순으로 받는다. */
export const useChatHistory = (
  query: GetChatHistoryQuery = {},
): UseQueryResult<GetChatHistoryResponse, Error> =>
  useQuery({ ...chatbotQueryKeys.history(query), enabled: !!getAccessToken() })
