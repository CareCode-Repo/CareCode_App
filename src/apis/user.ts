import { CareCode } from './interceptor'
import {
  GetProfileCompletionResponse,
  getProfileCompletionResponseSchema,
  GetUserInfoResponse,
  getUserInfoResponseSchema,
  ProfileImageResponse,
  profileImageResponseSchema,
  PutUserInfoBody,
  putUserInfoBodySchema,
  PutUserInfoResponse,
  putUserInfoResponseSchema,
} from '@/types/apis/user'

// GET /users/profile - 현재 로그인한 사용자 프로필
export const getUserInfo = async (): Promise<GetUserInfoResponse> => {
  const res = await CareCode.get('/users/profile')
  return getUserInfoResponseSchema.parse(res.data)
}

// PUT /users/profile - 프로필 수정
export const putUserInfo = async (body: PutUserInfoBody): Promise<PutUserInfoResponse> => {
  const parsedBody = putUserInfoBodySchema.parse(body)
  const res = await CareCode.put('/users/profile', parsedBody)
  return putUserInfoResponseSchema.parse(res.data)
}

/**
 * POST /users/me/profile-image - 프로필 이미지 업로드.
 *
 * 예전에는 URL 문자열만 받는 PUT 뿐이라 파일을 올릴 곳이 없었다.
 * 서버가 저장 후 주소를 돌려주므로 그 값을 그대로 화면에 반영한다.
 */
export const uploadProfileImage = async (file: File): Promise<ProfileImageResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await CareCode.post('/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return profileImageResponseSchema.parse(res.data)
}

// GET /users/profile/completion - 프로필 완성도
export const getProfileCompletion = async (): Promise<GetProfileCompletionResponse> => {
  const res = await CareCode.get('/users/profile/completion')
  return getProfileCompletionResponseSchema.parse(res.data)
}

// POST /auth/logout - 서버의 리프레시 토큰 세션 폐기
export const postLogout = async (): Promise<void> => {
  await CareCode.post('/auth/logout')
}
