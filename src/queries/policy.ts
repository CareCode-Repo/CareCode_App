import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
} from '@tanstack/react-query'
import { getAccessToken } from '@/apis/auth'
import {
  deletePolicyBookmark,
  getBenefitAmountConsensus,
  getMissedBenefits,
  getPolicyBookmarks,
  getLatestPolicies,
  getPoliciesByCategory,
  getPolicyCategories,
  getPopularPolicies,
  getPolicyRecommendations,
  getRegionalComparison,
  postBenefitAmountReport,
  postPolicyBookmark,
  searchPolicies,
  getPolicyById,
} from '@/apis/policy'
import {
  BenefitAmountConsensus,
  BenefitAmountReportBody,
  GetLatestPoliciesResponse,
  PolicyCategoryList,
  MissedBenefitSummary,
  PersonalizedPolicy,
  PolicyBookmark,
  PolicySearchRequestDto,
  PolicySearchResponseDto,
  GetPolicyByIdResponse,
  RegionalComparison,
  RegionalComparisonQuery,
} from '@/types/apis/policy'

export const policyQueryKeys = createQueryKeys('policy', {
  detail: (id: number) => [id],
  latest: () => ['latest'],
  categories: () => ['categories'],
  byCategory: (category: string) => ['category', category],
  popular: () => ['popular'],
  search: (searchParams: Omit<PolicySearchRequestDto, 'page' | 'size'>) => [searchParams],
  recommendations: (limit: number) => ['recommendations', limit],
  missedBenefits: () => ['missed-benefits'],
  regionalComparison: (query: RegionalComparisonQuery) => ['regional-comparison', query],
  bookmarks: () => ['bookmarks'],
  amountConsensus: (policyId: number) => ['amount-consensus', policyId],
})

/** 정책 카테고리 목록. 자주 바뀌지 않으므로 오래 신선하게 둔다. */
export const usePolicyCategories = (): UseQueryResult<PolicyCategoryList, Error> =>
  useQuery({
    queryKey: policyQueryKeys.categories().queryKey,
    queryFn: getPolicyCategories,
    staleTime: 1000 * 60 * 60,
  })

export const usePoliciesByCategory = (
  category: string,
): UseQueryResult<GetLatestPoliciesResponse, Error> =>
  useQuery({
    queryKey: policyQueryKeys.byCategory(category).queryKey,
    queryFn: () => getPoliciesByCategory(category),
    enabled: !!category,
  })

export const usePopularPolicies = (): UseQueryResult<GetLatestPoliciesResponse, Error> =>
  useQuery({
    queryKey: policyQueryKeys.popular().queryKey,
    queryFn: getPopularPolicies,
    staleTime: 1000 * 60 * 10,
  })

export const useBenefitAmountConsensus = (
  policyId: number,
): UseQueryResult<BenefitAmountConsensus, Error> =>
  useQuery({
    queryKey: policyQueryKeys.amountConsensus(policyId).queryKey,
    queryFn: () => getBenefitAmountConsensus(policyId),
    enabled: Number.isFinite(policyId) && policyId > 0,
  })

/**
 * 실수령액 제보.
 * 응답이 곧 갱신된 합의 현황이라 그대로 캐시에 넣어 "몇 명 남았는지" 를 즉시 반영한다.
 */
export const useReportBenefitAmount = (
  policyId: number,
): UseMutationResult<BenefitAmountConsensus, Error, BenefitAmountReportBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BenefitAmountReportBody) => postBenefitAmountReport(policyId, body),
    onSuccess: (consensus) => {
      queryClient.setQueryData(policyQueryKeys.amountConsensus(policyId).queryKey, consensus)
      // 합의가 확정되면 정책 금액이 채워지므로 상세·목록도 다시 받는다.
      if (consensus.confirmed) {
        queryClient.invalidateQueries({ queryKey: policyQueryKeys._def })
      }
    },
  })
}

export const useGetPolicyById = (
  policyId: number,
): UseQueryResult<GetPolicyByIdResponse, Error> => {
  return useQuery({
    queryKey: policyQueryKeys.detail(policyId).queryKey,
    queryFn: () => getPolicyById({ policyId }),
    enabled: !!policyId,
  })
}

export const useGetLatestPolicies = (): UseQueryResult<GetLatestPoliciesResponse, Error> => {
  return useQuery({
    queryKey: policyQueryKeys.latest().queryKey,
    queryFn: () => getLatestPolicies(),
  })
}

export const useSearchPolicies = (
  searchParams: Omit<PolicySearchRequestDto, 'page' | 'size'>,
): UseInfiniteQueryResult<InfiniteData<PolicySearchResponseDto>, Error> => {
  return useInfiniteQuery({
    queryKey: policyQueryKeys.search(searchParams).queryKey,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) =>
      await searchPolicies({
        ...searchParams,
        page: pageParam,
        size: 10,
      }),
    getNextPageParam: (lastPage: PolicySearchResponseDto) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    enabled: !!searchParams.keyword,
  })
}

/** 아래 셋은 자녀 정보와 거주지를 쓰므로 로그인 상태에서만 조회한다. */

export const usePolicyRecommendations = (limit = 10): UseQueryResult<PersonalizedPolicy[], Error> =>
  useQuery({
    queryKey: policyQueryKeys.recommendations(limit).queryKey,
    queryFn: () => getPolicyRecommendations(limit),
    enabled: !!getAccessToken(),
  })

export const useMissedBenefits = (): UseQueryResult<MissedBenefitSummary, Error> =>
  useQuery({
    queryKey: policyQueryKeys.missedBenefits().queryKey,
    queryFn: getMissedBenefits,
    enabled: !!getAccessToken(),
  })

export const useRegionalComparison = (
  query: RegionalComparisonQuery = {},
): UseQueryResult<RegionalComparison, Error> =>
  useQuery({
    queryKey: policyQueryKeys.regionalComparison(query).queryKey,
    queryFn: () => getRegionalComparison(query),
    enabled: !!getAccessToken(),
    // 정책 데이터는 자주 바뀌지 않고 계산 비용이 큰 응답이라 오래 들고 있는다.
    staleTime: 1000 * 60 * 30,
  })

export const usePolicyBookmarks = (): UseQueryResult<PolicyBookmark[], Error> =>
  useQuery({
    queryKey: policyQueryKeys.bookmarks().queryKey,
    queryFn: getPolicyBookmarks,
    enabled: !!getAccessToken(),
  })

/**
 * 정책 북마크 토글.
 * 서버가 추가/삭제를 따로 두고 있어 현재 상태를 받아 방향을 정한다.
 */
export const useTogglePolicyBookmark = (): UseMutationResult<
  void,
  Error,
  { policyId: number; bookmarked: boolean }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ policyId, bookmarked }) => {
      if (bookmarked) {
        await deletePolicyBookmark(policyId)
        return
      }
      await postPolicyBookmark(policyId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyQueryKeys.bookmarks().queryKey })
    },
  })
}
