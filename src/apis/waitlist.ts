import { z } from 'zod'
import { CareCode } from './interceptor'
import {
  AdmissionCandidateList,
  admissionCandidateListSchema,
  AdmissionCandidateQuery,
  admissionCandidateQuerySchema,
  AdmissionForecast,
  admissionForecastQuerySchema,
  AdmissionForecastQuery,
  admissionForecastSchema,
  forecastAccuracySchema,
  ForecastAccuracy,
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

/**
 * GET /facilities/forecast-accuracy - 예측이 실제로 얼마나 맞았는지 (공개)
 *
 * 기간별(1·3·6개월) 최신 측정 결과. 표본이 부족한 기간은 아예 목록에 없다.
 */
export const getForecastAccuracy = async (): Promise<ForecastAccuracy[]> => {
  const res = await CareCode.get('/facilities/forecast-accuracy')
  return z.array(forecastAccuracySchema).parse(res.data ?? [])
}

/** GET /facilities/admission-candidates - 아이 기준으로 들어갈 수 있는 곳 */
export const getAdmissionCandidates = async (
  query: AdmissionCandidateQuery,
): Promise<AdmissionCandidateList> => {
  const params = admissionCandidateQuerySchema.parse(query)
  const res = await CareCode.get('/facilities/admission-candidates', { params })
  return admissionCandidateListSchema.parse(res.data)
}
