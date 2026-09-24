import { createQueryKeys } from '@lukemorales/query-key-factory'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { getLegalDocument, getLegalVersion, LegalDocumentType } from '@/apis/legal'

export const legalQueries = createQueryKeys('legal', {
  version: () => ({
    queryKey: ['version'],
    queryFn: getLegalVersion,
  }),

  document: (type: LegalDocumentType) => ({
    queryKey: ['document', type],
    queryFn: () => getLegalDocument(type),
  }),
})

/**
 * 시행 중인 약관 버전.
 * 개정은 잦지 않으므로 오래 캐시하되, 동의를 기록할 때는 이 값이 있어야 한다.
 */
export const useLegalVersion = (): UseQueryResult<string, Error> =>
  useQuery({ ...legalQueries.version(), staleTime: 1000 * 60 * 60 })

export const useLegalDocument = (
  type: LegalDocumentType,
  enabled = true,
): UseQueryResult<string, Error> =>
  useQuery({ ...legalQueries.document(type), enabled, staleTime: 1000 * 60 * 60 })
