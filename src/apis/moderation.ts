import { CareCode } from './interceptor'
import {
  BlockedUserIds,
  blockedUserIdsSchema,
  Report,
  ReportCreateBody,
  reportCreateBodySchema,
  reportSchema,
} from '@/types/apis/moderation'

// POST /community/reports - 신고가 누적되면 서버가 자동으로 숨김 처리한다
export const postReport = async (body: ReportCreateBody): Promise<Report> => {
  const parsedBody = reportCreateBodySchema.parse(body)
  const res = await CareCode.post('/community/reports', parsedBody)
  return reportSchema.parse(res.data)
}

// POST /community/blocks/{userId}
export const postBlockUser = async (userId: number): Promise<void> => {
  await CareCode.post(`/community/blocks/${userId}`)
}

// DELETE /community/blocks/{userId}
export const deleteBlockUser = async (userId: number): Promise<void> => {
  await CareCode.delete(`/community/blocks/${userId}`)
}

// GET /community/blocks
export const getBlockedUsers = async (): Promise<BlockedUserIds> => {
  const res = await CareCode.get('/community/blocks')
  return blockedUserIdsSchema.parse(res.data)
}
