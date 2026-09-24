import { z } from 'zod'

// /chatbot/chat 챗봇 채팅: 메세지 보내고 결과 받음
export const postChatMessageBodySchema = z.object({
  userId: z.string(),
  message: z.string(),
  sessionId: z.string().optional(),
  childAge: z.number().optional(),
  context: z.string().optional(),
})
export type PostChatMessageBody = z.infer<typeof postChatMessageBodySchema>
export const postChatMessageResponseSchema = z.object({
  messageId: z.number(),
  response: z.string(),
  intentType: z.string(),
  confidence: z.number(),
  sessionId: z.string(),
  timestamp: z.string(),
  // suggestion: z.array(z.string()),
  // relatedTopics: z.array(z.string()),
})
export type PostChatMessageResponse = z.infer<typeof postChatMessageResponseSchema>

/**
 * GET /chatbot/history — 대화 기록.
 *
 * 사용자는 서버가 토큰에서 꺼내 쓴다(`currentUserFacade.requireCurrentUserId()`).
 * 예전에는 `userId` 를 쿼리로 보냈지만 서버는 그 값을 읽지 않는다.
 * 응답도 `{ success, content }` 래퍼가 아니라 **배열**이다.
 */
export const getChatHistoryQuerySchema = z.object({
  sessionId: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
})
export type GetChatHistoryQuery = z.infer<typeof getChatHistoryQuerySchema>
export const getChatHistoryResponseSchema = z.object({
  messageId: z.number(),
  message: z.string(),
  response: z.string(),
  messageType: z.string(),
  intentType: z.string(),
  confidence: z.number(),
  sessionId: z.string(),
  // 사용자가 아직 도움 여부를 남기지 않으면 null 이다.
  isHelpful: z.boolean().nullish(),
  createdAt: z.string(),
})
export type ChatHistoryItem = z.infer<typeof getChatHistoryResponseSchema>
export const getChatHistoryListSchema = z.array(getChatHistoryResponseSchema)
export type GetChatHistoryResponse = z.infer<typeof getChatHistoryListSchema>

// /chatbot/sessions 챗봇 대화 리스트 가져오기
/** 사용자는 서버가 토큰에서 꺼낸다. 여기에 userId 를 넣어도 무시된다. */
export const getChatSessionsQuerySchema = z.object({
  page: z.number().optional(),
  size: z.number().optional(),
})
export type GetChatSessionsQuery = z.infer<typeof getChatSessionsQuerySchema>
export const sessionResponseSchema = z.object({
  sessionId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  messageCount: z.number(),
  lastActivityAt: z.string(),
  createdAt: z.string(),
})
export const getChatSessionsResponseSchema = z.array(sessionResponseSchema)
export type GetChatSessionsResponse = z.infer<typeof getChatSessionsResponseSchema>
