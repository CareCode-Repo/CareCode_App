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
  cancelBooking,
  deleteFacilityReview,
  getFacilities,
  getFacilitiesByLocation,
  getFacilitiesByType,
  getFacilityById,
  getFacilityReviews,
  getMyBookings,
  getPopularFacilities,
  postAdvancedSearchFacilities,
  postBookFacility,
  postFacilityReview,
  postSearchFacilities,
  putFacilityReview,
} from '@/apis/facility'
import {
  Booking,
  Facility,
  FacilityAdvancedSearchBody,
  FacilityReview,
  FacilityReviewBody,
  GetFacilitiesByLocationPath,
  GetFacilitiesByTypePath,
  GetFacilityByIdPath,
  PostFacilitiesSearchBody,
  PostFacilitiesSearchResponse,
  PostFacilityBookBody,
} from '@/types/apis/facility'

export const facilityQueries = createQueryKeys('facility', {
  list: (page: number, size: number) => ({
    queryKey: ['list', { page, size }],
    queryFn: () => getFacilities({ page, size }),
  }),

  popular: (limit: number) => ({
    queryKey: ['popular', { limit }],
    queryFn: () => getPopularFacilities(limit),
  }),

  detail: (id: GetFacilityByIdPath['id']) => ({
    queryKey: ['detail', id],
    queryFn: () => getFacilityById({ id }),
  }),

  type: (facilityType: GetFacilitiesByTypePath['facilityType']) => ({
    queryKey: ['type', facilityType],
    queryFn: () => getFacilitiesByType({ facilityType }),
  }),

  location: (location: GetFacilitiesByLocationPath['location']) => ({
    queryKey: ['location', location],
    queryFn: () => getFacilitiesByLocation({ location }),
  }),

  search: (body: PostFacilitiesSearchBody) => ({
    queryKey: ['search', body],
    queryFn: () => postSearchFacilities(body),
  }),

  advancedSearch: (body: FacilityAdvancedSearchBody) => ({
    queryKey: ['advanced-search', body],
    queryFn: () => postAdvancedSearchFacilities(body),
  }),

  reviews: (facilityId: number) => ({
    queryKey: ['reviews', facilityId],
    queryFn: () => getFacilityReviews(facilityId),
  }),

  myBookings: () => ({
    queryKey: ['my-bookings'],
    queryFn: getMyBookings,
  }),
})

export const usePopularFacilities = (limit = 10): UseQueryResult<Facility[], Error> =>
  useQuery({ ...facilityQueries.popular(limit) })

export const useFacilityDetail = (id: number): UseQueryResult<Facility, Error> =>
  useQuery({ ...facilityQueries.detail(id), enabled: Number.isFinite(id) && id > 0 })

export const useFacilitySearch = (
  body: PostFacilitiesSearchBody,
  enabled = true,
): UseQueryResult<PostFacilitiesSearchResponse, Error> =>
  useQuery({ ...facilityQueries.search(body), enabled })

/**
 * 조건 기반 고급 검색.
 * 조건이 하나도 없으면 전체 조회와 다를 게 없어 켜지 않는다.
 */
export const useAdvancedFacilitySearch = (
  body: FacilityAdvancedSearchBody,
  enabled = true,
): UseQueryResult<Facility[], Error> =>
  useQuery({
    ...facilityQueries.advancedSearch(body),
    enabled: enabled && Object.values(body).some((value) => value !== undefined),
  })

export const useFacilityReviews = (facilityId: number): UseQueryResult<FacilityReview[], Error> =>
  useQuery({ ...facilityQueries.reviews(facilityId), enabled: Number.isFinite(facilityId) })

export const useMyBookings = (): UseQueryResult<Booking[], Error> =>
  useQuery({ ...facilityQueries.myBookings(), enabled: !!getAccessToken() })

export const useCreateFacilityReview = (
  facilityId: number,
): UseMutationResult<FacilityReview, Error, FacilityReviewBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: FacilityReviewBody) => postFacilityReview(facilityId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityQueries.reviews(facilityId).queryKey })
      queryClient.invalidateQueries({ queryKey: facilityQueries.detail(facilityId).queryKey })
    },
  })
}

export const useUpdateFacilityReview = (
  facilityId: number,
): UseMutationResult<FacilityReview, Error, { reviewId: number; body: FacilityReviewBody }> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, body }) => putFacilityReview(reviewId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityQueries.reviews(facilityId).queryKey })
    },
  })
}

export const useDeleteFacilityReview = (
  facilityId: number,
): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: number) => deleteFacilityReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityQueries.reviews(facilityId).queryKey })
      queryClient.invalidateQueries({ queryKey: facilityQueries.detail(facilityId).queryKey })
    },
  })
}

export const useCreateBooking = (
  facilityId: number,
): UseMutationResult<Booking, Error, PostFacilityBookBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PostFacilityBookBody) => postBookFacility({ facilityId }, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityQueries.myBookings().queryKey })
    },
  })
}

export const useCancelBooking = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityQueries.myBookings().queryKey })
    },
  })
}
