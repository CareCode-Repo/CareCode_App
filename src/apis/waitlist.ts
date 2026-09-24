import { z } from 'zod'
import { CareCode } from './interceptor'
import {
  AdmissionForecast,
  admissionForecastQuerySchema,
  AdmissionForecastQuery,
  admissionForecastSchema,
  FacilityPopularity,
  facilityPopularitySchema,
  WaitlistEntry,
  waitlistEntryListSchema,
  WaitlistRegisterBody,
  waitlistRegisterBodySchema,
  WaitlistStats,
  waitlistStatsSchema,
  WaitlistStatus,
} from '@/types/apis/waitlist'

const registerResultSchema = z.object({ waitlistId: z.number() })

// POST /facilities/{facilityId}/waitlist
export const postWaitlist = async (
  facilityId: number,
  body: WaitlistRegisterBody = {},
): Promise<number> => {
  const parsedBody = waitlistRegisterBodySchema.parse(body)
  const res = await CareCode.post(`/facilities/${facilityId}/waitlist`, parsedBody)
  return registerResultSchema.parse(res.data).waitlistId
}

/**
 * PATCH /facilities/waitlist/{waitlistId}
 *
 * 결과를 남겨야 대기 기간이 확정되고, 그 기록이 다른 부모의 통계가 된다.
 */
export const patchWaitlistResult = async (
  waitlistId: number,
  status: Extract<WaitlistStatus, 'ADMITTED' | 'GAVE_UP'>,
  resolvedAt?: string,
  note?: string,
): Promise<void> => {
  await CareCode.patch(`/facilities/waitlist/${waitlistId}`, null, {
    params: { status, ...(resolvedAt ? { resolvedAt } : {}), ...(note ? { note } : {}) },
  })
}

// GET /facilities/waitlist/me
export const getMyWaitlists = async (): Promise<WaitlistEntry[]> => {
  const res = await CareCode.get('/facilities/waitlist/me')
  return waitlistEntryListSchema.parse(res.data)
}

// GET /facilities/{facilityId}/waitlist/stats - 입소한 사람들의 실제 기록 기반
export const getWaitlistStats = async (facilityId: number): Promise<WaitlistStats> => {
  const res = await CareCode.get(`/facilities/${facilityId}/waitlist/stats`)
  return waitlistStatsSchema.parse(res.data)
}

// GET /facilities/{facilityId}/admission-forecast
export const getAdmissionForecast = async (
  facilityId: number,
  query: AdmissionForecastQuery = {},
): Promise<AdmissionForecast> => {
  const parsedQuery = admissionForecastQuerySchema.parse(query)
  const res = await CareCode.get(`/facilities/${facilityId}/admission-forecast`, {
    params: parsedQuery,
  })
  return admissionForecastSchema.parse(res.data)
}

// GET /facilities/{facilityId}/popularity - 충원율 추이 (시설이 개입할 수 없는 지표)
export const getFacilityPopularity = async (facilityId: number): Promise<FacilityPopularity> => {
  const res = await CareCode.get(`/facilities/${facilityId}/popularity`)
  return facilityPopularitySchema.parse(res.data)
}
