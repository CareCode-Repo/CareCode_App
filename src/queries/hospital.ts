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
  deleteHospitalReview,
  getHospitalById,
  getHospitalLikeStatus,
  getHospitalReviews,
  getHospitals,
  getHospitalsByType,
  getNearbyHospitals,
  getPopularHospitals,
  getLikedHospitals,
  likeHospital,
  postHospitalReview,
  putHospitalReview,
  unlikeHospital,
} from '@/apis/hospital'
import {
  CreateHospitalReviewBody,
  Hospital,
  HospitalLikeStatus,
  HospitalReview,
  NearbyHospitalsQuery,
  UpdateHospitalReviewBody,
} from '@/types/apis/hospital'

export const hospitalQueries = createQueryKeys('hospital', {
  list: (page?: number, size?: number) => ({
    queryKey: ['list', { page, size }],
    queryFn: () => getHospitals(page, size),
  }),

  liked: () => ({
    queryKey: ['liked'],
    queryFn: getLikedHospitals,
  }),

  popular: (limit: number) => ({
    queryKey: ['popular', limit],
    queryFn: () => getPopularHospitals(limit),
  }),

  detail: (id: number) => ({
    queryKey: ['detail', id],
    queryFn: () => getHospitalById(id),
  }),

  byType: (type: string) => ({
    queryKey: ['type', type],
    queryFn: () => getHospitalsByType(type),
  }),

  nearby: (query: NearbyHospitalsQuery) => ({
    queryKey: ['nearby', query],
    queryFn: () => getNearbyHospitals(query),
  }),

  reviews: (id: number) => ({
    queryKey: ['reviews', id],
    queryFn: () => getHospitalReviews(id),
  }),

  likeStatus: (id: number) => ({
    queryKey: ['like-status', id],
    queryFn: () => getHospitalLikeStatus(id),
  }),
})

export const useHospitals = (page?: number, size?: number): UseQueryResult<Hospital[], Error> =>
  useQuery({ ...hospitalQueries.list(page, size) })

/** 내가 찜한 병원. 찜은 걸 수 있는데 모아 볼 곳이 없었다. */
export const useLikedHospitals = (): UseQueryResult<Hospital[], Error> =>
  useQuery({ ...hospitalQueries.liked(), enabled: !!getAccessToken() })

export const usePopularHospitals = (limit = 10): UseQueryResult<Hospital[], Error> =>
  useQuery({ ...hospitalQueries.popular(limit) })

export const useHospitalDetail = (id: number): UseQueryResult<Hospital, Error> =>
  useQuery({ ...hospitalQueries.detail(id), enabled: Number.isFinite(id) && id > 0 })

/** 위치 권한을 받은 뒤에만 실행되도록 좌표가 있을 때만 켠다. */
export const useNearbyHospitals = (
  query: NearbyHospitalsQuery | null,
): UseQueryResult<Hospital[], Error> =>
  useQuery({
    ...hospitalQueries.nearby(query ?? { lat: 0, lng: 0, radius: 1 }),
    enabled: !!query,
  })

export const useHospitalReviews = (id: number): UseQueryResult<HospitalReview[], Error> =>
  useQuery({ ...hospitalQueries.reviews(id), enabled: Number.isFinite(id) && id > 0 })

/** 찜 여부는 로그인한 사용자에게만 의미가 있으므로 토큰이 있을 때만 조회한다. */
export const useHospitalLikeStatus = (id: number): UseQueryResult<HospitalLikeStatus, Error> =>
  useQuery({
    ...hospitalQueries.likeStatus(id),
    enabled: Number.isFinite(id) && id > 0 && !!getAccessToken(),
  })

/**
 * 찜 토글.
 * 서버 응답을 기다리지 않고 먼저 화면을 바꾸고, 실패하면 이전 값으로 되돌린다.
 * (누르는 즉시 반응해야 하는 조작이라 낙관적 업데이트가 맞다)
 */
export const useToggleHospitalLike = (
  hospitalId: number,
): UseMutationResult<void, Error, boolean, { previous?: HospitalLikeStatus }> => {
  const queryClient = useQueryClient()
  const statusKey = hospitalQueries.likeStatus(hospitalId).queryKey

  return useMutation({
    mutationFn: (liked: boolean) => (liked ? unlikeHospital(hospitalId) : likeHospital(hospitalId)),

    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: statusKey })
      const previous = queryClient.getQueryData<HospitalLikeStatus>(statusKey)

      queryClient.setQueryData<HospitalLikeStatus>(statusKey, (prev) =>
        prev
          ? { ...prev, liked: !liked, likeCount: Math.max(0, prev.likeCount + (liked ? -1 : 1)) }
          : prev,
      )

      return { previous }
    },

    onError: (_error, _liked, context) => {
      if (context?.previous) queryClient.setQueryData(statusKey, context.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statusKey })
      queryClient.invalidateQueries({ queryKey: hospitalQueries.popular._def })
    },
  })
}

export const useCreateHospitalReview = (
  hospitalId: number,
): UseMutationResult<HospitalReview, Error, CreateHospitalReviewBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateHospitalReviewBody) => postHospitalReview(hospitalId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueries.reviews(hospitalId).queryKey })
    },
  })
}

export const useUpdateHospitalReview = (
  hospitalId: number,
): UseMutationResult<
  HospitalReview,
  Error,
  { reviewId: number; body: UpdateHospitalReviewBody }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, body }) => putHospitalReview(reviewId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueries.reviews(hospitalId).queryKey })
    },
  })
}

export const useDeleteHospitalReview = (
  hospitalId: number,
): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: number) => deleteHospitalReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalQueries.reviews(hospitalId).queryKey })
    },
  })
}
