import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import { getAccessToken } from '@/apis/auth'
import { deleteBlockUser, getBlockedUsers, postBlockUser, postReport } from '@/apis/moderation'
import { communityQueries } from '@/queries/community'
import { BlockedUserIds, Report, ReportCreateBody } from '@/types/apis/moderation'

export const moderationQueries = createQueryKeys('moderation', {
  blocks: () => ({
    queryKey: ['blocks'],
    queryFn: getBlockedUsers,
  }),
})

export const useBlockedUsers = (): UseQueryResult<BlockedUserIds, Error> =>
  useQuery({ ...moderationQueries.blocks(), enabled: !!getAccessToken() })

export const useReport = (): UseMutationResult<Report, Error, ReportCreateBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postReport,
    onSuccess: () => {
      // 신고 누적으로 대상이 숨겨질 수 있으므로 목록을 다시 받는다.
      queryClient.invalidateQueries({ queryKey: communityQueries._def })
    },
  })
}

export const useBlockUser = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postBlockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationQueries.blocks().queryKey })
      queryClient.invalidateQueries({ queryKey: communityQueries._def })
    },
  })
}

export const useUnblockUser = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBlockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationQueries.blocks().queryKey })
      queryClient.invalidateQueries({ queryKey: communityQueries._def })
    },
  })
}
