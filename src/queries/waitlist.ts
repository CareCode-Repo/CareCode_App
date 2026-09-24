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
  getAdmissionForecast,
  getFacilityPopularity,
  getMyWaitlists,
  getWaitlistStats,
  patchWaitlistResult,
  postWaitlist,
} from '@/apis/waitlist'
import {
  AdmissionForecast,
  AdmissionForecastQuery,
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
