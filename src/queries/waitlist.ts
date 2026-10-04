import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import { getAccessToken } from '@/apis/auth'
import {
  getAdmissionCandidates,
  getAdmissionForecast,
  getForecastAccuracy,
  getFacilityPopularity,
  getMyWaitlists,
  getWaitlistStats,
  patchWaitlistResult,
  postWaitlist,
} from '@/apis/waitlist'
import {
  AdmissionCandidateList,
  AdmissionCandidateQuery,
  AdmissionForecast,
  AdmissionForecastQuery,
  ForecastAccuracy,
  FacilityPopularity,
  WaitlistEntry,
  WaitlistRegisterBody,
  WaitlistStats,
  WaitlistStatus,
} from '@/types/apis/waitlist'

export const waitlistQueries = createQueryKeys('waitlist', {
  mine: () => ({
    queryKey: ['mine'],
    queryFn: getMyWaitlists,
  }),

  stats: (facilityId: number) => ({
    queryKey: ['stats', facilityId],
    queryFn: () => getWaitlistStats(facilityId),
  }),

  forecast: (facilityId: number, query: AdmissionForecastQuery) => ({
    queryKey: ['forecast', facilityId, query],
    queryFn: () => getAdmissionForecast(facilityId, query),
  }),

  popularity: (facilityId: number) => ({
    queryKey: ['popularity', facilityId],
    queryFn: () => getFacilityPopularity(facilityId),
  }),

  /** 측정 결과는 주 1회만 갱신된다. 화면마다 다시 받을 이유가 없다. */
  accuracy: () => ({
    queryKey: ['forecast-accuracy'],
    queryFn: getForecastAccuracy,
  }),

  candidates: (query: AdmissionCandidateQuery) => ({
    queryKey: ['admission-candidates', query],
    queryFn: () => getAdmissionCandidates(query),
  }),
})

export const useMyWaitlists = (): UseQueryResult<WaitlistEntry[], Error> =>
  useQuery({ ...waitlistQueries.mine(), enabled: !!getAccessToken() })

const isValidFacility = (facilityId: number): boolean =>
  Number.isFinite(facilityId) && facilityId > 0

export const useWaitlistStats = (facilityId: number): UseQueryResult<WaitlistStats, Error> =>
  useQuery({ ...waitlistQueries.stats(facilityId), enabled: isValidFacility(facilityId) })

export const useAdmissionForecast = (
  facilityId: number,
  query: AdmissionForecastQuery = {},
): UseQueryResult<AdmissionForecast, Error> =>
  useQuery({
    ...waitlistQueries.forecast(facilityId, query),
    enabled: isValidFacility(facilityId),
  })

/** 입소 예측이 과거에 얼마나 맞았는지. 공개 통계라 로그인과 무관하다. */
export const useForecastAccuracy = (): UseQueryResult<ForecastAccuracy[], Error> =>
  useQuery({ ...waitlistQueries.accuracy(), staleTime: 60 * 60 * 1000 })

/** 아이 기준 입소 후보. 지역과 월령이 모두 있어야 계산할 수 있다. */
export const useAdmissionCandidates = (
  query: Partial<AdmissionCandidateQuery>,
): UseQueryResult<AdmissionCandidateList, Error> => {
  const ready = !!query.region && query.childAgeMonths != null && query.childAgeMonths >= 0
  return useQuery({
    ...waitlistQueries.candidates(query as AdmissionCandidateQuery),
    enabled: ready,
    staleTime: 10 * 60 * 1000,
  })
}

export const useFacilityPopularity = (
  facilityId: number,
): UseQueryResult<FacilityPopularity, Error> =>
  useQuery({ ...waitlistQueries.popularity(facilityId), enabled: isValidFacility(facilityId) })

export const useRegisterWaitlist = (
  facilityId: number,
): UseMutationResult<number, Error, WaitlistRegisterBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: WaitlistRegisterBody) => postWaitlist(facilityId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistQueries.mine().queryKey })
      queryClient.invalidateQueries({ queryKey: waitlistQueries.stats(facilityId).queryKey })
    },
  })
}

/**
 * 대기 결과 기록.
 * 이 기록이 쌓여야 다른 부모가 보는 "실제 대기 기간" 통계가 만들어진다.
 */
export const useResolveWaitlist = (): UseMutationResult<
  void,
  Error,
  {
    waitlistId: number
    status: Extract<WaitlistStatus, 'ADMITTED' | 'GAVE_UP'>
    resolvedAt?: string
    note?: string
  }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ waitlistId, status, resolvedAt, note }) =>
      patchWaitlistResult(waitlistId, status, resolvedAt, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistQueries._def })
    },
  })
}
