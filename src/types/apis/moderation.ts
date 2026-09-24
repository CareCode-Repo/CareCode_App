import { z } from 'zod'

export const ReportTargetType = ['POST', 'COMMENT'] as const
export type ReportTargetType = (typeof ReportTargetType)[number]

export const ReportReason = ['SPAM', 'ABUSE', 'SEXUAL', 'PRIVACY', 'FALSE_INFO', 'OTHER'] as const
export type ReportReason = (typeof ReportReason)[number]

/** 신고 사유 선택지 (서버 Report.ReportReason 의 displayName 과 동일) */
export const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: '스팸/광고' },
  { value: 'ABUSE', label: '욕설/비방' },
  { value: 'SEXUAL', label: '음란물' },
  { value: 'PRIVACY', label: '개인정보 노출' },
  { value: 'FALSE_INFO', label: '허위 정보' },
  { value: 'OTHER', label: '기타' },
]

export const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDING: '접수',
  ACCEPTED: '조치 완료',
  REJECTED: '반려',
}

// POST /community/reports - 서버 ReportCreateRequest 대응
export const reportCreateBodySchema = z.object({
  targetType: z.enum(ReportTargetType),
  targetId: z.number(),
  reason: z.enum(ReportReason),
  detail: z.string().max(1000, '상세 내용은 1000자를 넘을 수 없습니다').optional(),
})
export type ReportCreateBody = z.infer<typeof reportCreateBodySchema>

// 서버 ReportResponse 대응
export const reportSchema = z.object({
  id: z.number(),
  targetType: z.string(),
  targetId: z.number(),
  reason: z.string(),
  reasonDisplay: z.string().nullish(),
  detail: z.string().nullish(),
  status: z.string(),
  moderatorNote: z.string().nullish(),
  createdAt: z.string().nullish(),
  resolvedAt: z.string().nullish(),
})
export type Report = z.infer<typeof reportSchema>

// GET /community/blocks - 차단한 사용자 ID 목록
export const blockedUserIdsSchema = z.array(z.number())
export type BlockedUserIds = z.infer<typeof blockedUserIdsSchema>
