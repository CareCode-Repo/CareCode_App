import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { clearTokens, getAccessToken } from '@/apis/auth'
import {
  deleteAccount,
  getConsentHistory,
  getConsents,
  getMyDataExport,
  postConsent,
} from '@/apis/privacy'
import {
  ConsentHistoryItem,
  ConsentStatusResponse,
  ConsentUpdateBody,
  ExportMyDataResponse,
} from '@/types/apis/privacy'

export const privacyQueries = createQueryKeys('privacy', {
  consents: () => ({
    queryKey: ['consents'],
    queryFn: getConsents,
  }),

  consentHistory: () => ({
    queryKey: ['consents', 'history'],
    queryFn: getConsentHistory,
  }),
})

export const useConsents = (): UseQueryResult<ConsentStatusResponse, Error> =>
  useQuery({ ...privacyQueries.consents(), enabled: !!getAccessToken() })

export const useConsentHistory = (): UseQueryResult<ConsentHistoryItem[], Error> =>
  useQuery({ ...privacyQueries.consentHistory(), enabled: !!getAccessToken() })

export const useUpdateConsent = (): UseMutationResult<
  ConsentStatusResponse,
  Error,
  ConsentUpdateBody
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postConsent,
    onSuccess: (status) => {
      queryClient.setQueryData(privacyQueries.consents().queryKey, status)
      queryClient.invalidateQueries({ queryKey: privacyQueries.consentHistory().queryKey })
    },
  })
}

export const useExportMyData = (): UseMutationResult<ExportMyDataResponse, Error, void> =>
  useMutation({ mutationFn: getMyDataExport })

/** 탈퇴 성공 시 토큰과 캐시를 모두 비우고 첫 화면으로 보낸다. */
export const useDeleteAccount = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      clearTokens()
      queryClient.clear()
      router.replace('/')
    },
  })
}
