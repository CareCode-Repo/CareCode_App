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
  deleteChild,
  getChildById,
  getGrowthChart,
  getLatestGrowth,
  getMyChildren,
  getOverdueVaccinations,
  getVaccinationSchedule,
  patchVaccinationComplete,
  getSiblingOverview,
  postChild,
  putChild,
} from '@/apis/child'
import {
  Child,
  ChildBody,
  GrowthMetric,
  GrowthPoint,
  SiblingOverview,
  VaccinationSchedule,
} from '@/types/apis/child'

export const childQueries = createQueryKeys('child', {
  list: () => ({
    queryKey: ['list'],
    queryFn: getMyChildren,
  }),

  overview: () => ({
    queryKey: ['overview'],
    queryFn: getSiblingOverview,
  }),

  detail: (childId: number) => ({
    queryKey: ['detail', childId],
    queryFn: () => getChildById(childId),
  }),

  vaccinations: (childId: number) => ({
    queryKey: ['vaccinations', childId],
    queryFn: () => getVaccinationSchedule(childId),
  }),

  overdueVaccinations: (childId: number) => ({
    queryKey: ['vaccinations', childId, 'overdue'],
    queryFn: () => getOverdueVaccinations(childId),
  }),

  growth: (childId: number, metric: GrowthMetric) => ({
    queryKey: ['growth', childId, metric],
    queryFn: () => getGrowthChart(childId, metric),
  }),

  latestGrowth: (childId: number, metric: GrowthMetric) => ({
    queryKey: ['growth', childId, metric, 'latest'],
    queryFn: () => getLatestGrowth(childId, metric),
  }),
})

export const useMyChildren = (): UseQueryResult<Child[], Error> =>
  useQuery({ ...childQueries.list(), enabled: !!getAccessToken() })

/** 모든 자녀의 접종·대기·다자녀 혜택을 한 화면에서 본다. */
export const useSiblingOverview = (): UseQueryResult<SiblingOverview, Error> =>
  useQuery({ ...childQueries.overview(), enabled: !!getAccessToken() })

export const useChildDetail = (childId: number): UseQueryResult<Child, Error> =>
  useQuery({ ...childQueries.detail(childId), enabled: Number.isFinite(childId) && childId > 0 })

export const useVaccinationSchedule = (
  childId: number,
): UseQueryResult<VaccinationSchedule[], Error> =>
  useQuery({
    ...childQueries.vaccinations(childId),
    enabled: Number.isFinite(childId) && childId > 0,
  })

export const useGrowthChart = (
  childId: number,
  metric: GrowthMetric,
): UseQueryResult<GrowthPoint[], Error> =>
  useQuery({
    ...childQueries.growth(childId, metric),
    enabled: Number.isFinite(childId) && childId > 0,
  })

export const useCreateChild = (): UseMutationResult<Child, Error, ChildBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childQueries.list().queryKey })
    },
  })
}

export const useUpdateChild = (childId: number): UseMutationResult<Child, Error, ChildBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ChildBody) => putChild(childId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(childQueries.detail(childId).queryKey, updated)
      queryClient.invalidateQueries({ queryKey: childQueries.list().queryKey })
    },
  })
}

export const useDeleteChild = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childQueries.list().queryKey })
    },
  })
}

export const useCompleteVaccination = (
  childId: number,
): UseMutationResult<
  VaccinationSchedule,
  Error,
  { scheduleId: number; completedDate?: string }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ scheduleId, completedDate }) =>
      patchVaccinationComplete(childId, scheduleId, completedDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childQueries.vaccinations(childId).queryKey })
    },
  })
}
