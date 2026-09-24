import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import {
  getKakaoAuthUrl,
  postKakaoAuth,
  postLogin,
  postKakaoCompleteRegistration,
  setTokens,
} from '@/apis/auth'
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
 * (리프레시 토큰은 서버가 HttpOnly 쿠키로 심으므로 프런트가 다루지 않는다)
 */
export const usePostLogin = (): UseMutationResult<PostLoginResponse, Error, PostLoginBody> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      if (!data.success) return
      setTokens(data.accessToken, data.user.userId, data.expiresIn)
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
