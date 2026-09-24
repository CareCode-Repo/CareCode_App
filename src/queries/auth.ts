import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import {
  getKakaoAuthUrl,
  postKakaoAuth,
  postLogin,
  postKakaoCompleteRegistration,
  setTokens,
} from '@/apis/auth'
import { saveRefreshToken } from '@/apis/session'
import {
  GetKakaoAuthUrlResponse,
  PostKakaoAuthBody,
  PostKakaoAuthResponse,
  PostLoginBody,
  PostLoginResponse,
  KakaoRegistrationRequest,
  KakaoRegistrationResponse,
} from '@/types/apis/auth'

export const useGetKakaoAuthUrlMutation = (): UseMutationResult<
  GetKakaoAuthUrlResponse,
  Error,
  void
> => {
  return useMutation({
    mutationFn: () => getKakaoAuthUrl(),
  })
}

/**
 * 이메일·비밀번호 로그인.
 *
 * 성공하면 액세스 토큰을 메모리에 넣는 것까지 여기서 끝낸다. 호출부마다 setTokens 를
 * 부르게 하면 한 곳만 빠뜨려도 "로그인은 됐는데 인증이 안 되는" 상태가 된다.
 * 리프레시 토큰은 웹에서는 서버가 HttpOnly 쿠키로 심어 프런트가 다루지 않지만,
 * 앱에서는 그 쿠키가 막혀 응답 본문의 값을 받아 보관해야 한다. 그 분기는 setTokens 안에 있다.
 */
export const usePostLogin = (): UseMutationResult<PostLoginResponse, Error, PostLoginBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postLogin,
    onSuccess: async (data) => {
      if (!data.success) return
      setTokens(data.accessToken, data.user.userId, data.expiresIn)
      // 앱에서만 실제로 저장된다(웹은 쿠키가 맡는다). 저장을 기다려야 곧바로 앱을 껐을 때도
      // 다음 실행에서 로그인이 이어진다.
      await saveRefreshToken(data.refreshToken)
      // 로그인 전에 비어 있던 응답들을 다시 받는다.
      queryClient.clear()
    },
  })
}

export const usePostKakaoAuth = (): UseMutationResult<
  PostKakaoAuthResponse,
  Error,
  PostKakaoAuthBody
> => {
  return useMutation({
    mutationFn: postKakaoAuth,
  })
}

export const usePostKakaoCompleteRegistration = (): UseMutationResult<
  KakaoRegistrationResponse,
  Error,
  KakaoRegistrationRequest
> => {
  return useMutation({
    mutationFn: postKakaoCompleteRegistration,
  })
}
