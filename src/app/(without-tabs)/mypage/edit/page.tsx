'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useEffect, useState } from 'react'
import { getErrorMessage } from '@/apis/errors'
import SearchIcon from '@/assets/icons/search.svg'
import AuthGuard from '@/components/common/AuthGuard'
import Button from '@/components/common/Button'
import ErrorView from '@/components/common/Error'
import Label from '@/components/common/Label'
import Layout from '@/components/common/Layout'
import Spacer from '@/components/common/Spacer'
import Input from '@/components/common/input'
import EditProfileImage from '@/components/features/mypage/EditProfileImage'
import { useUpdateProfile, useUploadProfileImage, useUserProfile } from '@/queries/user'
import { toAbsoluteFileUrl } from '@/utils/file'

// Daum Postcode API 타입 정의
interface DaumPostcodeData {
  userSelectedType: string
  roadAddress: string
  jibunAddress: string
  bname: string
  buildingName: string
  apartment: string
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
        width?: string
        height?: string
      }) => {
        embed: (element: HTMLElement) => void
      }
    }
  }
}

/** 서버는 주소를 한 문자열로 들고 있다. 화면에서만 "기본 + 상세" 로 나눠 다룬다. */
const SEPARATOR = ' | '

const splitAddress = (value?: string | null): { base: string; detail: string } => {
  if (!value) return { base: '', detail: '' }
  const index = value.indexOf(SEPARATOR)
  if (index === -1) return { base: value, detail: '' }
  return { base: value.slice(0, index), detail: value.slice(index + SEPARATOR.length) }
}

const joinAddress = (base: string, detail: string): string =>
  detail.trim() ? `${base.trim()}${SEPARATOR}${detail.trim()}` : base.trim()

const ProfileEditContent = (): ReactElement => {
  const router = useRouter()
  const { data: profile, isLoading, isError, refetch } = useUserProfile()
  const { mutate: updateProfile, isPending, isError: isSaveError, error } = useUpdateProfile()
  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadProfileImage()

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [showPostcode, setShowPostcode] = useState(false)

  // 저장된 값을 채워 넣는다. 빈 폼으로 시작하면 저장할 때 기존 값을 지우게 된다.
  useEffect(() => {
    if (!profile) return
    const { base, detail } = splitAddress(profile.address)
    setName(profile.name ?? '')
    setPhoneNumber(profile.phoneNumber ?? '')
    setBirthDate(profile.birthDate ?? '')
    setAddress(base)
    setDetailAddress(detail)
  }, [profile])

  // 다음 우편번호 서비스는 이 화면에서만 쓰므로 여기서 싣고 나갈 때 걷는다.
  useEffect(() => {
    if (window.daum) return

    const script = document.createElement('script')
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  useEffect(() => {
    if (!showPostcode || !window.daum) return
    const container = document.getElementById('postcode-container')
    if (!container) return

    new window.daum.Postcode({
      oncomplete: (data) => {
        const base = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress

        let extra = ''
        if (data.userSelectedType === 'R') {
          if (data.bname && /[동로가]$/.test(data.bname)) extra += data.bname
          if (data.buildingName && data.apartment === 'Y') {
            extra += extra ? `, ${data.buildingName}` : data.buildingName
          }
          if (extra) extra = ` (${extra})`
        }

        setAddress(base + extra)
        setShowPostcode(false)
      },
      width: '100%',
      height: '400px',
    }).embed(container)
  }, [showPostcode])

  const isNameValid = name.trim().length >= 2 && name.trim().length <= 10

  const handleSave = () => {
    if (!isNameValid) return

    updateProfile(
      {
        name: name.trim(),
        // 서버가 보내지 않은 키는 건드리지 않으므로, 비운 값은 빈 문자열로 명시한다.
        phoneNumber: phoneNumber.trim(),
        birthDate: birthDate.trim(),
        address: joinAddress(address, detailAddress),
      },
      { onSuccess: () => router.back() },
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorView content="프로필을 불러오지 못했어요." onRetry={() => refetch()} />
  }

  return (
    <>
      <div className="flex grow flex-col gap-8 overflow-y-auto p-6">
        <EditProfileImage
          imageUrl={toAbsoluteFileUrl(profile?.profileImageUrl)}
          isUploading={isUploadingImage}
          onSelect={(file) => uploadImage(file)}
        />

        <Input
          label="이름"
          required
          value={name}
          onChange={setName}
          placeholder="이름을 입력해주세요 (2-10글자)"
          maxLength={10}
          errorText={name.trim() && !isNameValid ? '이름은 2~10글자여야 해요' : ''}
          showErrorText={!!name.trim() && !isNameValid}
        />

        <Input
          label="전화번호"
          value={phoneNumber}
          onChange={setPhoneNumber}
          type="tel"
          placeholder="010-0000-0000"
        />

        <Input
          label="생년월일"
          value={birthDate}
          onChange={setBirthDate}
          type="date"
          placeholder="YYYY-MM-DD"
        />

        <div className="flex flex-col">
          <Label>주소</Label>
          <p className="text-b2-regular pb-2 text-gray-600">
            거주지를 넣으면 지역별 지원금과 가까운 시설을 찾아드려요.
          </p>
          <Input
            readOnly
            value={address}
            placeholder="주소를 검색해주세요"
            onClick={() => setShowPostcode(true)}
            aria-label="주소 검색"
            rightIcon={<SearchIcon className="size-6 cursor-pointer fill-gray-400" aria-hidden />}
          />
          <Spacer className="h-2.5" />

          {showPostcode && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-b1-semibold text-gray-800">주소 검색</span>
                <button
                  type="button"
                  onClick={() => setShowPostcode(false)}
                  className="text-b1-regular text-gray-600 hover:text-gray-800"
                >
                  닫기
                </button>
              </div>
              <div
                id="postcode-container"
                className="h-96 w-full overflow-hidden rounded-md border border-gray-300"
              />
            </div>
          )}

          <Input
            value={detailAddress}
            onChange={setDetailAddress}
            placeholder="상세 주소를 입력해주세요"
            aria-label="상세 주소"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-6 pb-6">
        {isSaveError && (
          <p className="text-red text-b2-regular" role="alert">
            {getErrorMessage(error, '저장하지 못했어요. 잠시 후 다시 시도해주세요.')}
          </p>
        )}
        <Button color="green" onClick={handleSave} disabled={!isNameValid || isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </>
  )
}

const ProfileEditPage = (): ReactElement => (
  <AuthGuard>
    <Layout hasTopNav title="프로필 수정" hasBackButton>
      <ProfileEditContent />
    </Layout>
  </AuthGuard>
)

export default ProfileEditPage
